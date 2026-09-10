import {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {cpp} from '@codemirror/lang-cpp';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useColorMode} from '@docusaurus/theme-common';
import type {CompilerExplorerProps} from './index';
import styles from './styles.module.css';

interface CompileResult {
  tokens: string;
  ast: string;
  hir: string;
  ir: string;
  cfg: string;
  stage: string;
  error: string;
}

interface CompilerModule {
  compile(source: string): CompileResult;
}

type ModuleFactory = (opts?: {
  locateFile?: (path: string) => string;
}) => Promise<CompilerModule>;

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
  const wasmJsUrl = useBaseUrl('/wasm/compiler-dungeon-wasm.js');
  const wasmDirUrl = useBaseUrl('/wasm/');

  const moduleRef = useRef<CompilerModule | null>(null);

  const [source, setSource] = useState(defaultSource);
  const [activeTab, setActiveTab] = useState<TabKey>('ir');
  const [result, setResult] = useState<CompileResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    import(/* webpackIgnore: true */ wasmJsUrl)
      .then((mod) => {
        const factory = mod.default as ModuleFactory;
        return factory({locateFile: (path) => wasmDirUrl + path});
      })
      .then((compilerModule) => {
        if (cancelled) return;
        moduleRef.current = compilerModule;
        setReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !moduleRef.current) return;

    const handle = setTimeout(() => {
      try {
        setResult(moduleRef.current!.compile(source));
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
  );
}
