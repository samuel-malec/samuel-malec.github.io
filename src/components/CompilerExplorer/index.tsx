import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

export type CompilerExplorerProps = {
  defaultSource: string;
};

export default function CompilerExplorer(props: CompilerExplorerProps): ReactNode {
  return (
    <BrowserOnly
      fallback={<div className={styles.loading}>Loading compiler explorer…</div>}>
      {() => {
        const Explorer = require('./Explorer').default;
        return <Explorer {...props} />;
      }}
    </BrowserOnly>
  );
}
