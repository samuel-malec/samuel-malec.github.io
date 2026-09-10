import {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {cpp} from '@codemirror/lang-cpp';
import {Graphviz} from '@hpcc-js/wasm-graphviz';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useColorMode} from '@docusaurus/theme-common';
import type {CompilerExplorerProps} from './index';
import styles from './styles.module.css';

interface CompileResult {
  tokens: string;
  ast: string;
  hir: string;
  ir: string;
  cfg_dot: string;
  stage: string;
  error: string;
}

interface CompilerModule {
  compile(source: string): CompileResult;
}

type ModuleFactory = (opts?: {
  locateFile?: (path: string) => string;
}) => Promise<CompilerModule>;

type TabKey = 'tokens' | 'ast' | 'hir' | 'ir' | 'ssa';

const TEXT_TABS: {key: Exclude<TabKey, 'ssa'>; label: string}[] = [
  {key: 'tokens', label: 'Tokens'},
  {key: 'ast', label: 'AST'},
  {key: 'hir', label: 'HIR'},
  {key: 'ir', label: 'IR'},
];

export default function Explorer({defaultSource}: CompilerExplorerProps): ReactNode {
  const {colorMode} = useColorMode();
  const wasmJsUrl = useBaseUrl('/wasm/compiler-dungeon-wasm.js');
  const wasmDirUrl = useBaseUrl('/wasm/');

  const moduleRef = useRef<CompilerModule | null>(null);
  const graphvizRef = useRef<Graphviz | null>(null);

  const [source, setSource] = useState(defaultSource);
  const [activeTab, setActiveTab] = useState<TabKey>('ir');
  const [result, setResult] = useState<CompileResult | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import(/* webpackIgnore: true */ wasmJsUrl).then((mod) => {
        const factory = mod.default as ModuleFactory;
        return factory({locateFile: (path) => wasmDirUrl + path});
      }),
      Graphviz.load(),
    ])
      .then(([compilerModule, graphviz]) => {
        if (cancelled) return;
        moduleRef.current = compilerModule;
        graphvizRef.current = graphviz;
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
          tokens: '',
          ast: '',
          hir: '',
          ir: '',
          cfg_dot: '',
          stage: '',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [source, ready]);

  useEffect(() => {
    if (!result?.cfg_dot || !graphvizRef.current) {
      setSvg(null);
      return;
    }
    try {
      setSvg(graphvizRef.current.layout(result.cfg_dot, 'svg', 'dot'));
    } catch {
      setSvg(null);
    }
  }, [result?.cfg_dot]);

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
          {TEXT_TABS.map(({key, label}) => (
            <button
              key={key}
              type="button"
              className={activeTab === key ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
          <button
            type="button"
            className={activeTab === 'ssa' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('ssa')}>
            SSA
          </button>
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

        {ready && activeTab !== 'ssa' && (
          <pre className={styles.output}>{result?.[activeTab] ?? ''}</pre>
        )}

        {ready && activeTab === 'ssa' && (
          svg ? (
            <div
              className={styles.svgOutput}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{__html: svg}}
            />
          ) : (
            <div className={styles.output}>No SSA graph yet.</div>
          )
        )}
      </div>
    </div>
  );
}
