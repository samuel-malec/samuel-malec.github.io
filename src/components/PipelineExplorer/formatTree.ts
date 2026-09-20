// Turns the compiler's own indentation-based AST/HIR dump into a connector-decorated
// tree (the "├──" / "└──" look) without knowing anything about the grammar it prints.
// It works purely from each line's leading-whitespace width, using a width stack to
// derive nesting depth — robust to whatever indentation convention the printer uses,
// as long as "more indented" consistently means "nested deeper".
export function formatIndentTree(raw: string): string {
  const rawLines = raw.replace(/\r\n/g, '\n').split('\n');

  const lines = rawLines
    .map((line) => {
      const match = /^(\s*)(.*)$/.exec(line);
      return {indent: match ? match[1].length : 0, text: match ? match[2] : line};
    })
    .filter((l) => l.text.trim().length > 0);

  if (lines.length === 0) return raw;

  const widthStack: number[] = [];
  const withDepth = lines.map(({indent, text}) => {
    while (widthStack.length > 0 && widthStack[widthStack.length - 1] >= indent) {
      widthStack.pop();
    }
    widthStack.push(indent);
    return {depth: widthStack.length - 1, text};
  });

  const isLast = withDepth.map((line, i) => {
    const next = withDepth[i + 1];
    return !next || next.depth < line.depth;
  });

  const isLastAtDepth: boolean[] = [];
  const out: string[] = [];
  withDepth.forEach((line, i) => {
    isLastAtDepth[line.depth] = isLast[i];
    let prefix = '';
    for (let d = 0; d < line.depth; d++) {
      prefix += isLastAtDepth[d] ? '    ' : '│   ';
    }
    if (line.depth > 0) {
      prefix += isLast[i] ? '└── ' : '├── ';
    }
    out.push(prefix + line.text);
  });

  return out.join('\n');
}
