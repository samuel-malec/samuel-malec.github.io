import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

export type PipelineExplorerProps = {
  defaultSource: string;
};

export default function PipelineExplorer(props: PipelineExplorerProps): ReactNode {
  return (
    <BrowserOnly fallback={<div className={styles.loading}>Loading compiler explorer…</div>}>
      {() => {
        const Impl = require('./PipelineExplorer').default;
        return <Impl {...props} />;
      }}
    </BrowserOnly>
  );
}
