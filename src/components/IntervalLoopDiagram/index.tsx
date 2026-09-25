import type {ReactNode} from 'react';

import styles from './styles.module.css';

const ALT =
  'Sea-of-Nodes fragment of a counting loop. Const 0, with interval [0, 0], and ' +
  'the back edge from i + 1, with interval [1, +infinity), both flow into a phi ' +
  'node for i whose widened interval is [0, +infinity). The phi node feeds i + 1 ' +
  'and the comparison i < n, which also reads the parameter n over the full ' +
  'integer range.';

/**
 * Interval facts on the Sea-of-Nodes form of `i = 0; while (i < n) i = i + 1;`,
 * showing where widening applies. Kept as a component rather than inline SVG in
 * MDX so that it stays typechecked and out of the markdown parser's way.
 */
export default function IntervalLoopDiagram(): ReactNode {
  return (
    <figure className={styles.figure}>
      <svg className={styles.svg} viewBox="0 0 560 300" role="img" aria-label={ALT}>
        <title>Interval facts on a Sea-of-Nodes loop fragment</title>
        <defs>
          <marker
            id="ai-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse">
            <path className={styles.arrowhead} d="M 0 1 L 10 5 L 0 9 z" />
          </marker>
        </defs>
        <g className={styles.box}>
          <rect x="20" y="20" width="150" height="56" rx="4" />
          <rect x="20" y="122" width="150" height="56" rx="4" />
          <rect x="20" y="224" width="150" height="56" rx="4" />
          <rect x="320" y="20" width="220" height="56" rx="4" />
          <rect x="320" y="122" width="220" height="56" rx="4" />
        </g>
        <g className={styles.edge}>
          <line x1="95" y1="76" x2="95" y2="118" markerEnd="url(#ai-arrow)" />
          <line x1="95" y1="178" x2="95" y2="220" markerEnd="url(#ai-arrow)" />
          <line x1="170" y1="142" x2="316" y2="142" markerEnd="url(#ai-arrow)" />
          <line x1="430" y1="76" x2="430" y2="118" markerEnd="url(#ai-arrow)" />
          <path
            d="M 170 262 C 252 262 252 172 174 160"
            strokeDasharray="5 4"
            markerEnd="url(#ai-arrow)"
          />
        </g>
        <g className={styles.node}>
          <text x="36" y="46">Const 0</text>
          <text x="36" y="148">{'φ(i)'}</text>
          <text x="36" y="250">i + 1</text>
          <text x="336" y="46">Parm n</text>
          <text x="336" y="148">{'i < n'}</text>
        </g>
        <g className={styles.fact}>
          <text x="36" y="66">[0, 0]</text>
          <text x="36" y="168">{'[0, +∞)'}</text>
          <text x="36" y="270">{'[1, +∞)'}</text>
          <text x="336" y="66">[INT_MIN, INT_MAX]</text>
          <text x="336" y="168">{'{true, false}'}</text>
        </g>
        <g className={styles.label}>
          <text x="256" y="212">back edge</text>
        </g>
      </svg>
      <figcaption className={styles.caption}>
        Facts are attached per IR node. <code>{'φ(i)'}</code> starts at{' '}
        <code>[0, 0]</code> from the loop pre-header; the back edge from{' '}
        <code>i + 1</code> raises the upper bound on every iteration, so widening
        at the <code>{'φ'}</code> jumps straight to <code>{'[0, +∞)'}</code>{' '}
        and the computation terminates.
      </figcaption>
    </figure>
  );
}
