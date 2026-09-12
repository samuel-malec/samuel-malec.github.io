import {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {cpp} from '@codemirror/lang-cpp';
import {useColorMode} from '@docusaurus/theme-common';
import {useCompilerModule, type CompileResult} from '@site/src/lib/compilerModule';
import type {CompilerExplorerProps} from './index';
import styles from './styles.module.css';

type TabKey = 'tokens' | 'ast' | 'hir' | 'ir' | 'cfg';

const TABS: {key: TabKey; label: string}[] = [
  {key: 'tokens', label: 'Tokens'},
  {key: 'ast', label: 'AST'},
  {key: 'hir', label: 'HIR'},
  {key: 'ir', label: 'IR'},
  {key: 'cfg', label: 'SSA'},
];

const EMPTY_RESULT: CompileResult = {
  tokens: '', ast: '', hir: '', ir: '', cfg: '', stage: '', error: '',
};

export default function Explorer({defaultSource}: CompilerExplorerProps): ReactNode {
  const {colorMode} = useColorMode();
  const {module, ready, loadError} = useCompilerModule();

  const [source, setSource] = useState(defaultSource);
  const [activeTab, setActiveTab] = useState<TabKey>('ir');
  const [result, setResult] = useState<CompileResult | null>(null);

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
        Failed to load the compiler explorer: {loadError}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.explorer}>
        <div className={styles.editorPane}>
          <CodeMirror
            value={source}
            height="360px"
            theme={colorMode === 'dark' ? 'dark' : 'light'}
            extensions={[cpp()]}
            onChange={setSource}
          />
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

          {!ready && <div className={styles.loading}>Loading compiler…</div>}

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
