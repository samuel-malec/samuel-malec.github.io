import {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {useColorMode} from '@docusaurus/theme-common';
import {useQthuModule, type PipelineResult} from '@site/src/lib/qthuModule';
import {findLikelyInfiniteLoop} from './loopGuard';
import type {QthuExplorerProps} from './index';
import styles from './styles.module.css';

type TabKey = 'ast' | 'hir' | 'lir' | 'hicthu' | 'locthu' | 'bytecode';

const TABS: {key: TabKey; label: string}[] = [
  {key: 'ast', label: 'AST'},
  {key: 'hir', label: 'HIR'},
  {key: 'lir', label: 'LIR'},
  {key: 'hicthu', label: 'HICthu'},
  {key: 'locthu', label: 'LOCthu'},
  {key: 'bytecode', label: 'QuickJS'},
];

const EMPTY_RESULT: PipelineResult = {
  ast: '', hir: '', lir: '', hicthu: '', locthu: '', bytecode: '', runOutput: '', stage: '', error: '',
};

const JS_EXTENSIONS = [javascript()];

export default function Explorer({defaultSource}: QthuExplorerProps): ReactNode {
  const {colorMode} = useColorMode();
  const {module, ready, loadError} = useQthuModule();

  const [source, setSource] = useState(defaultSource);
  const [activeTab, setActiveTab] = useState<TabKey>('hicthu');
  const [result, setResult] = useState<PipelineResult | null>(null);

  useEffect(() => {
    if (!ready || !module) return;

    const handle = setTimeout(() => {
      // The embedded QuickJS runtime actually executes the compiled bytecode,
      // synchronously, on the main thread, with no time or step limit -- an
      // infinite loop in the source freezes the whole page with no way to
      // recover. Catch the obvious case before it ever reaches the wasm call.
      const infiniteLoop = findLikelyInfiniteLoop(source);
      if (infiniteLoop) {
        setResult({...EMPTY_RESULT, error: `Not running -- ${infiniteLoop}`});
        return;
      }

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

  const runFailed =
    !!result?.error || (!!result?.runOutput && /exception|failed to load bytecode/i.test(result.runOutput));
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
              extensions={JS_EXTENSIONS}
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
        </div>
      </div>
    </div>
  );
}
