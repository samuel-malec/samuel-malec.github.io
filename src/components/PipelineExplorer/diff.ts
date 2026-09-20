// A plain, textbook LCS line diff. Deliberately not a "smart" diff library —
// IR before/after a single pass is short (tens of lines) and rarely reordered,
// so the classic O(n*m) dynamic-programming longest-common-subsequence diff is
// simple, robust, and always correct for this input size.
export interface DiffLine {
  text: string;
  kind: 'added' | 'removed' | 'context';
}

export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.length ? before.split('\n') : [];
  const b = after.length ? after.split('\n') : [];
  const n = a.length;
  const m = b.length;

  const lcs: number[][] = Array.from({length: n + 1}, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({text: a[i], kind: 'context'});
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({text: a[i], kind: 'removed'});
      i++;
    } else {
      result.push({text: b[j], kind: 'added'});
      j++;
    }
  }
  while (i < n) result.push({text: a[i++], kind: 'removed'});
  while (j < m) result.push({text: b[j++], kind: 'added'});

  return result;
}
