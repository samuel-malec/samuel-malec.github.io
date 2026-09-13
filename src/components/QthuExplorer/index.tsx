import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

export type QthuExplorerProps = {
  defaultSource: string;
};

export default function QthuExplorer(props: QthuExplorerProps): ReactNode {
  return (
    <BrowserOnly
      fallback={<div className={styles.loading}>Loading qthu pipeline explorer…</div>}>
      {() => {
        const Explorer = require('./Explorer').default;
        return <Explorer {...props} />;
      }}
    </BrowserOnly>
  );
}
