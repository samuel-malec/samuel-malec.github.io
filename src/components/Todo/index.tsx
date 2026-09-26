import type {ReactNode} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

/**
 * A placeholder that is visible on the rendered page, not just in the source.
 * Write the real content in its place and delete the <Todo> wrapper.
 *
 * Grep for "<Todo" to find everything still outstanding.
 */
export default function Todo({
  children,
  inline = false,
}: {
  children: ReactNode;
  /** Compact single-line variant, for short blurbs. */
  inline?: boolean;
}): ReactNode {
  return (
    <div className={clsx(styles.todo, inline && styles.inline)}>
      <span className={styles.badge}>TODO</span>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
