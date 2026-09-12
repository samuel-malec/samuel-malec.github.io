import {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {cpp} from '@codemirror/lang-cpp';
import {useColorMode} from '@docusaurus/theme-common';
import {useCompilerModule, type OptimizeResult} from '@site/src/lib/compilerModule';
import type {OptimizationPlaygroundProps} from './index';
import styles from './styles.module.css';

const EMPTY_RESULT: OptimizeResult = {before: '', after: '', stage: '', error: ''};

export default function Playground({defaultSource}: OptimizationPlaygroundProps): ReactNode {
  const {colorMode} = useColorMode();
  const {module, ready, loadError} = useCompilerModule();

  const [source, setSource] = useState(defaultSource);
  const [constantFolding, setConstantFolding] = useState(true);
  const [dce, setDce] = useState(true);
  const [result, setResult] = useState<OptimizeResult | null>(null);

  useEffect(() => {
    if (!ready || !module) return;

    const handle = setTimeout(() => {
      try {
        setResult(module.optimize(source, constantFolding, dce));
      } catch (err) {
        setResult({
          ...EMPTY_RESULT,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [source, constantFolding, dce, ready]);

  if (loadError) {
    return (
      <div className={styles.errorBanner}>
        Failed to load the optimization playground: {loadError}
      </div>
    );
  }

  return (
    <div className={styles.playground}>
      <div className={styles.editorPane}>
        <CodeMirror
          value={source}
          height="280px"
          theme={colorMode === 'dark' ? 'dark' : 'light'}
          extensions={[cpp()]}
          onChange={setSource}
        />
        <div className={styles.toggles}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={constantFolding}
              onChange={(e) => setConstantFolding(e.target.checked)}
            />
            Constant folding
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={dce}
              onChange={(e) => setDce(e.target.checked)}
            />
            Dead code elimination
          </label>
        </div>
      </div>

      <div className={styles.diffPane}>
        {!ready && <div className={styles.loading}>Loading compiler…</div>}

        {ready && result?.error && (
          <div className={styles.errorBanner}>
            {result.error}
            {result.stage && (
              <span className={styles.errorStage}> (reached: {result.stage})</span>
            )}
          </div>
        )}

        {ready && (
          <div className={styles.columns}>
            <div className={styles.column}>
              <div className={styles.columnLabel}>Before</div>
              <pre className={styles.output}>{result?.before ?? ''}</pre>
            </div>
            <div className={styles.column}>
              <div className={styles.columnLabel}>After</div>
              <pre className={styles.output}>{result?.after ?? ''}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
