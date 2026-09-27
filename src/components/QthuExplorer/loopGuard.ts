// The embedded QuickJS runtime executes whatever bytecode the source compiles
// to, synchronously, on the main thread, with no step/time limit -- and the
// wasm module isn't built with worker support, so it can't be moved off the
// main thread to make a hang recoverable (see the git history for the
// forensics). A source-level infinite loop therefore freezes the whole page
// with no way to interrupt it. This is a static, best-effort approximation
// that only catches the unambiguous case (a loop whose own body can't
// possibly change the outcome of its condition) -- it can't prove
// termination in general, but it catches the common typo that triggers this.

const KEYWORDS = new Set(['true', 'false', 'null', 'undefined']);

function matchBalanced(source: string, openIndex: number, open: string, close: string): number {
  let depth = 0;
  for (let i = openIndex; i < source.length; i++) {
    if (source[i] === open) depth++;
    else if (source[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractIdentifiers(text: string): string[] {
  const matches = text.match(/[A-Za-z_]\w*/g) ?? [];
  return matches.filter((id) => !KEYWORDS.has(id));
}

function isMutated(identifier: string, text: string): boolean {
  const pattern = new RegExp(`\\b${identifier}\\b\\s*(=(?!=)|\\+=|-=|\\*=|/=|\\+\\+|--)`);
  return pattern.test(text);
}

interface LoopMatch {
  keyword: 'while' | 'for';
  condition: string;
  increment: string;
  body: string;
}

function findLoops(source: string): LoopMatch[] {
  const loops: LoopMatch[] = [];
  const re = /\b(while|for)\s*\(/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(source))) {
    const parenOpen = match.index + match[0].length - 1;
    const parenClose = matchBalanced(source, parenOpen, '(', ')');
    if (parenClose === -1) continue;

    const inside = source.slice(parenOpen + 1, parenClose);
    const keyword = match[1] as 'while' | 'for';
    const condition = keyword === 'while' ? inside : (inside.split(';')[1] ?? '');
    const increment = keyword === 'for' ? (inside.split(';')[2] ?? '') : '';

    let cursor = parenClose + 1;
    while (cursor < source.length && /\s/.test(source[cursor])) cursor++;

    let body: string;
    if (source[cursor] === '{') {
      const braceClose = matchBalanced(source, cursor, '{', '}');
      body = braceClose === -1 ? '' : source.slice(cursor + 1, braceClose);
    } else {
      const stmtEnd = source.indexOf(';', cursor);
      body = stmtEnd === -1 ? source.slice(cursor) : source.slice(cursor, stmtEnd);
    }

    loops.push({keyword, condition, increment, body});
  }

  return loops;
}

function findLoopIssue(source: string): string | null {
  for (const loop of findLoops(source)) {
    const conditionIds = extractIdentifiers(loop.condition);
    const bodyAndIncrement = loop.body + '\n' + loop.increment;

    if (conditionIds.length === 0) {
      // `while (true)` / `for (;;)` etc -- only safe if the body can exit early.
      if (!/\breturn\b|\bbreak\b/.test(loop.body)) {
        return `"${loop.keyword} (${loop.condition.trim()})" has no way to stop -- add a break/return or a condition that changes.`;
      }
      continue;
    }

    const everMutated = conditionIds.some((id) => isMutated(id, bodyAndIncrement));
    if (!everMutated) {
      return `"${loop.keyword} (${loop.condition.trim()})" never changes ${conditionIds.length > 1 ? 'any of its variables' : `"${conditionIds[0]}"`} inside the loop, so it would run forever.`;
    }
  }

  return null;
}

interface FunctionMatch {
  name: string;
  params: string[];
  body: string;
}

function findFunctions(source: string): FunctionMatch[] {
  const fns: FunctionMatch[] = [];
  const re = /\bfunction\s+([A-Za-z_]\w*)\s*\(/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(source))) {
    const name = match[1];
    const parenOpen = match.index + match[0].length - 1;
    const parenClose = matchBalanced(source, parenOpen, '(', ')');
    if (parenClose === -1) continue;

    const params = extractIdentifiers(source.slice(parenOpen + 1, parenClose));

    let cursor = parenClose + 1;
    while (cursor < source.length && /\s/.test(source[cursor])) cursor++;
    if (source[cursor] !== '{') continue;

    const braceClose = matchBalanced(source, cursor, '{', '}');
    if (braceClose === -1) continue;

    fns.push({name, params, body: source.slice(cursor + 1, braceClose)});
  }

  return fns;
}

// Splits `f(a, b), g(c)` -- as found after a matched call's own opening paren
// -- into top-level, comma-separated argument texts (depth-aware, so commas
// inside a nested call or a parenthesised expression don't split early).
function splitArgs(argsText: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of argsText) {
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      args.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current);
  return args.map((a) => a.trim());
}

function findRecursionIssue(source: string): string | null {
  for (const fn of findFunctions(source)) {
    const selfCallRe = new RegExp(`\\b${fn.name}\\s*\\(`, 'g');
    const selfCalls: string[] = []; // each call's raw argument text
    let call: RegExpExecArray | null;

    while ((call = selfCallRe.exec(fn.body))) {
      const parenOpen = call.index + call[0].length - 1;
      const parenClose = matchBalanced(fn.body, parenOpen, '(', ')');
      if (parenClose === -1) continue;
      selfCalls.push(fn.body.slice(parenOpen + 1, parenClose));
    }

    if (selfCalls.length === 0) continue;

    // A recursive call that passes its parameters straight through, unchanged,
    // can never reach a different state on the next call -- whatever branch
    // led here will lead here again, forever.
    const passthrough = selfCalls.find((argsText) => {
      const args = splitArgs(argsText);
      return args.length === fn.params.length && args.every((arg, i) => arg === fn.params[i]);
    });
    if (passthrough) {
      return `"${fn.name}" calls itself with its arguments unchanged (${fn.name}(${passthrough.trim()})), so it can never reach a different case -- it would recurse forever.`;
    }

    // A function that only ever returns by calling itself has no base case at
    // all: every path recurses, so nothing can stop it. (A fresh, non-global
    // regex here -- reusing selfCallRe's `g` flag across several `.test()`
    // calls would carry its lastIndex over between them and miss matches.)
    const selfCallTestRe = new RegExp(`\\b${fn.name}\\s*\\(`);
    const returns = fn.body.match(/\breturn\b[^;]*;/g) ?? [];
    if (returns.length > 0 && returns.every((r) => selfCallTestRe.test(r))) {
      return `"${fn.name}" only ever returns by calling itself again, so it has no base case to stop the recursion.`;
    }
  }

  return null;
}

/** Returns a human-readable reason if `source` contains a loop or a
 * self-recursive function that looks certain to never terminate, or null if
 * nothing suspicious was found. This can't prove termination in general (and
 * doesn't attempt to trace indirect/mutual recursion across functions) -- it
 * only catches the unambiguous cases. */
export function findLikelyInfiniteLoop(source: string): string | null {
  return findLoopIssue(source) ?? findRecursionIssue(source);
}
