import {useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {cpp} from '@codemirror/lang-cpp';
import {useColorMode} from '@docusaurus/theme-common';
import {useCompilerModule, type CompileResult} from '@site/src/lib/compilerModule';
import {
  STAGES,
  TRANSFORM_ORDER,
  stageIndex,
  stageByKey,
  type StageKey,
  type RepresentationKey,
  type TransformKey,
} from './stages';
import {formatIndentTree} from './formatTree';
import TokenView from './TokenView';
import DiffView from './DiffView';
import type {PipelineExplorerProps} from './index';
import styles from './styles.module.css';

const EMPTY_COMPILE: CompileResult = {tokens: '', ast: '', hir: '', ir: '', cfg: '', stage: '', error: ''};

interface BeforeAfter {
  before: string;
  after: string;
  error: string;
  stage: string;
}

// Turns "every transform enabled up to and including `key`" into the positional flag tuple
// optimize() expects. Adding a fourth transform means adding one entry to TRANSFORM_ORDER in
// stages.ts and one field here — nothing else about this function changes.
function flagsUpTo(key: TransformKey | null): [boolean, boolean, boolean] {
  const idx = key ? TRANSFORM_ORDER.indexOf(key) : -1;
  const enabled = new Set(TRANSFORM_ORDER.slice(0, idx + 1));
  return [enabled.has('sccp'), enabled.has('dce'), enabled.has('simplify_cfg')];
}

function representationContent(key: RepresentationKey, result: CompileResult): string {
  switch (key) {
    case 'tokens':
      return result.tokens;
    case 'ast':
      return result.ast;
    case 'hir':
      return result.hir;
    case 'ir':
      return result.ir;
    case 'ssa':
      return result.cfg;
  }
}

export default function PipelineExplorer({defaultSource}: PipelineExplorerProps): ReactNode {
  const {colorMode} = useColorMode();
  const {module, ready, loadError} = useCompilerModule();

  const [source, setSource] = useState(defaultSource);
  const [activeStage, setActiveStage] = useState<StageKey>('ssa');

  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [beforeAfter, setBeforeAfter] = useState<BeforeAfter | null>(null);

  const stage = stageByKey(activeStage);
  const index = stageIndex(activeStage);

  useEffect(() => {
    if (!ready || !module) return;

    const handle = setTimeout(() => {
      try {
        if (stage.kind === 'representation') {
          setCompileResult(module.compile(source));
          setBeforeAfter(null);
        } else {
          // Each transform's "before" is every earlier transform's combined output (or plain
          // SSA, for the first one) — exactly what the real pipeline hands it — and "after" adds
          // this transform to that same set. Both calls always agree on everything before this
          // stage, so the diff shown is only ever this one pass's own contribution.
          const orderIdx = TRANSFORM_ORDER.indexOf(stage.key);
          const previousKey = orderIdx > 0 ? TRANSFORM_ORDER[orderIdx - 1] : null;
          const before = module.optimize(source, ...flagsUpTo(previousKey));
          const after = module.optimize(source, ...flagsUpTo(stage.key));
          setBeforeAfter({before: before.after, after: after.after, error: after.error, stage: after.stage});
          setCompileResult(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setCompileResult({...EMPTY_COMPILE, error: message});
        setBeforeAfter({before: '', after: '', error: message, stage: ''});
      }
    }, 300);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, activeStage, ready]);

  const error = stage.kind === 'representation' ? compileResult?.error : beforeAfter?.error;
  const reachedStage = stage.kind === 'representation' ? compileResult?.stage : beforeAfter?.stage;

  const goTo = (delta: number) => {
    const next = STAGES[index + delta];
    if (next) setActiveStage(next.key);
  };

  if (loadError) {
    return <div className={styles.errorBanner}>Failed to load the compiler: {loadError}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.explorer}>
        <div className={styles.sourcePane}>
          <div className={styles.paneLabel}>Source</div>
          <div className={styles.editor}>
            <CodeMirror
              value={source}
              height="220px"
              theme={colorMode === 'dark' ? 'dark' : 'light'}
              extensions={[cpp()]}
              onChange={setSource}
            />
          </div>
        </div>

        <PipelineNav active={activeStage} onSelect={setActiveStage} />

        <div className={styles.stepper}>
          <button type="button" className={styles.stepButton} onClick={() => goTo(-1)} disabled={index <= 0}>
            ← Previous
          </button>
          <span className={styles.stepCount}>
            {index + 1} / {STAGES.length}
          </span>
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => goTo(1)}
            disabled={index >= STAGES.length - 1}>
            Next →
          </button>
        </div>

        {!ready && <div className={styles.loading}>Loading compiler…</div>}

        {ready && error && (
          <div className={styles.errorBanner}>
            {error}
            {reachedStage && <span className={styles.errorStage}> (reached: {reachedStage})</span>}
          </div>
        )}

        {ready && (
          <div className={styles.outputPane}>
            <div className={styles.stageLabel}>
              {stage.kind === 'transform' ? `${STAGES[index - 1].label} → ${stage.label}` : stage.label}
            </div>

            {stage.kind === 'representation' && compileResult && !error && (
              <RepresentationView view={stage.view} content={representationContent(stage.key, compileResult)} />
            )}

            {stage.kind === 'transform' && beforeAfter && !error && (
              <DiffView before={beforeAfter.before} after={beforeAfter.after} />
            )}
          </div>
        )}

        <p className={styles.description}>{stage.description}</p>
      </div>
    </div>
  );
}

function RepresentationView({view, content}: {view: 'tokens' | 'tree' | 'code'; content: string}): ReactNode {
  if (view === 'tokens') return <TokenView raw={content} />;
  if (view === 'tree') return <pre className={styles.output}>{formatIndentTree(content)}</pre>;
  return <pre className={styles.output}>{content}</pre>;
}

function PipelineNav({active, onSelect}: {active: StageKey; onSelect: (key: StageKey) => void}): ReactNode {
  const representations = useMemo(() => STAGES.filter((s) => s.kind === 'representation'), []);
  const transforms = useMemo(() => STAGES.filter((s) => s.kind === 'transform'), []);

  return (
    <div className={styles.nav}>
      <div className={styles.navScroll}>
        <div className={styles.navGroup}>
          {representations.map((s, i) => (
            <span key={s.key} className={styles.navItemWrap}>
              {i > 0 && <span className={styles.navArrow}>→</span>}
              <button
                type="button"
                className={active === s.key ? styles.navTabActive : styles.navTab}
                onClick={() => onSelect(s.key)}>
                {s.label}
              </button>
            </span>
          ))}
        </div>

        <span className={styles.navDivider} aria-hidden="true" />

        <div className={styles.navGroup}>
          {transforms.map((s) => (
            <button
              key={s.key}
              type="button"
              className={active === s.key ? styles.navPillActive : styles.navPill}
              onClick={() => onSelect(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
