import {useMemo} from 'react';
import type {ReactNode} from 'react';
import {diffLines} from './diff';
import styles from './styles.module.css';

export default function DiffView({before, after}: {before: string; after: string}): ReactNode {
  const diff = useMemo(() => diffLines(before, after), [before, after]);

  return (
    <div className={styles.diffGrid}>
      <div className={styles.diffColumn}>
        <div className={styles.columnLabel}>Before</div>
        <pre className={styles.output}>
          {diff
            .filter((l) => l.kind !== 'added')
            .map((l, i) => (
              <div key={i} className={l.kind === 'removed' ? styles.lineRemoved : styles.lineContext}>
                {l.text.length ? l.text : ' '}
              </div>
            ))}
        </pre>
      </div>
      <div className={styles.diffColumn}>
        <div className={styles.columnLabel}>After</div>
        <pre className={styles.output}>
          {diff
            .filter((l) => l.kind !== 'removed')
            .map((l, i) => (
              <div key={i} className={l.kind === 'added' ? styles.lineAdded : styles.lineContext}>
                {l.text.length ? l.text : ' '}
              </div>
            ))}
        </pre>
      </div>
    </div>
  );
}
