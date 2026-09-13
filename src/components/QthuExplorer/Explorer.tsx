import {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {useColorMode} from '@docusaurus/theme-common';
import {useQthuModule, type PipelineResult} from '@site/src/lib/qthuModule';
import type {QthuExplorerProps} from './index';
import styles from './styles.module.css';

type TabKey = 'ast' | 'hir' | 'lin' | 'cthu' | 'bytecode';

const TABS: {key: TabKey; label: string}[] = [
  {key: 'ast', label: 'AST'},
  {key: 'hir', label: 'HIR'},
  {key: 'lin', label: 'LIN'},
  {key: 'cthu', label: 'Cthulhu (.ct)'},
  {key: 'bytecode', label: 'QuickJS bytecode'},
];

const EMPTY_RESULT: PipelineResult = {
  ast: '', hir: '', lin: '', cthu: '', bytecode: '', runOutput: '', stage: '', error: '',
};

export default function Explorer({defaultSource}: QthuExplorerProps): ReactNode {
  const {colorMode} = useColorMode();
  const {module, ready, loadError} = useQthuModule();

  const [source, setSource] = useState(defaultSource);
  const [activeTab, setActiveTab] = useState<TabKey>('cthu');
  const [result, setResult] = useState<PipelineResult | null>(null);

  useEffect(() => {
    if (!ready || !module) return;

    const handle = setTimeout(() => {
      try {
        setResult(module.compile(source));
      } catch (err) {
        setResult({
          ...EMPTY_RESULT,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [source, ready]);

  if (loadError) {
    return (
      <div className={styles.errorBanner}>
        Failed to load the qthu pipeline explorer: {loadError}
      </div>
    );
  }

  const runFailed = !!result?.runOutput && /exception|failed to load bytecode/i.test(result.runOutput);
  const runOk = !!result?.runOutput && !runFailed;

  return (
    <div className={styles.wrapper}>
      <div className={styles.explorer}>
        <div className={styles.editorPane}>
          <div className={styles.editorBox}>
            <CodeMirror
              value={source}
              height="360px"
              theme={colorMode === 'dark' ? 'dark' : 'light'}
              extensions={[javascript()]}
              onChange={setSource}
            />
          </div>

          {ready && result && (
            <div
              className={
                runOk ? styles.runOk : runFailed ? styles.runFail : styles.runNeutral
              }>
              {result.error
                ? `Compile error${result.stage ? ` (reached: ${result.stage})` : ''}: ${result.error}`
                : result.runOutput || 'Compiling…'}
            </div>
          )}
        </div>

        <div className={styles.outputPane}>
          <div className={styles.tabs}>
            {TABS.map(({key, label}) => (
              <button
                key={key}
                type="button"
                className={activeTab === key ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab(key)}>
                {label}
              </button>
            ))}
          </div>

          {!ready && <div className={styles.loading}>Loading qthu (js2ct + ct2qjs + QuickJS)…</div>}

          {ready && result?.error && (
            <div className={styles.errorBanner}>
              {result.error}
              {result.stage && (
                <span className={styles.errorStage}> (reached: {result.stage})</span>
              )}
            </div>
          )}

          {ready && <pre className={styles.output}>{result?.[activeTab] ?? ''}</pre>}
        </div>
      </div>
    </div>
  );
}
