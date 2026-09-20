import type {ReactNode} from 'react';
import styles from './styles.module.css';

interface Token {
  line: string;
  col: string;
  text: string;
  kind: string;
}

const TOKEN_RE = /^Ln\s*(\d+),\s*Col\s*(\d+)\[\s*(.*?),\s*(\w+)\s*\]$/;

function parseTokens(raw: string): Token[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = TOKEN_RE.exec(line);
      if (!m) return null;
      return {line: m[1], col: m[2], text: m[3], kind: m[4]};
    })
    .filter((t): t is Token => t !== null);
}

export default function TokenView({raw}: {raw: string}): ReactNode {
  const tokens = parseTokens(raw);

  // Fall back to the raw dump if the format ever changes underneath us —
  // never show a blank panel just because our own regex stopped matching.
  if (tokens.length === 0) {
    return <pre className={styles.output}>{raw}</pre>;
  }

  return (
    <div className={styles.tokenGrid}>
      {tokens.map((t, i) => (
        <div className={styles.tokenRow} key={i}>
          <span className={styles.tokenPos}>
            {t.line}:{t.col}
          </span>
          <span className={styles.tokenText}>{t.text}</span>
          <span className={styles.tokenKind} data-kind={t.kind}>
            {t.kind}
          </span>
        </div>
      ))}
    </div>
  );
}
