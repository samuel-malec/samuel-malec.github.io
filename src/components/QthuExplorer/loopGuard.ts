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

/** Returns a human-readable reason if `source` contains a loop that looks
 * certain to never terminate, or null if nothing suspicious was found. */
export function findLikelyInfiniteLoop(source: string): string | null {
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
