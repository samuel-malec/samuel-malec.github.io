import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

export type OptimizationPlaygroundProps = {
  defaultSource: string;
};

export default function OptimizationPlayground(props: OptimizationPlaygroundProps): ReactNode {
  return (
    <BrowserOnly
      fallback={<div className={styles.loading}>Loading optimization playground…</div>}>
      {() => {
        const Playground = require('./Playground').default;
        return <Playground {...props} />;
      }}
    </BrowserOnly>
  );
}
