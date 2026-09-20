// A single source of truth for every pipeline stage the explorer knows about.
// Adding a new representation or transformation pass means adding one entry
// here — the navigation, the step-through counter, and the output view all
// derive from this list rather than hardcoding a UI per stage.

export type RepresentationKey = 'tokens' | 'ast' | 'hir' | 'ir' | 'ssa';
export type TransformKey = 'sccp' | 'dce';
export type StageKey = RepresentationKey | TransformKey;

export interface RepresentationStage {
  kind: 'representation';
  key: RepresentationKey;
  label: string;
  description: string;
  // How the raw text for this stage should be rendered.
  view: 'tokens' | 'tree' | 'code';
}

export interface TransformStage {
  kind: 'transform';
  key: TransformKey;
  label: string;
  description: string;
  // Which representation this pass rewrites — used to decide what "before"
  // means, and to label the before/after view (e.g. "SSA → SCCP").
  appliesTo: RepresentationKey;
}

export type Stage = RepresentationStage | TransformStage;

export const STAGES: Stage[] = [
  {
    kind: 'representation',
    key: 'tokens',
    label: 'Tokens',
    view: 'tokens',
    description:
      'The lexer breaks the source text into a flat stream of tokens — keywords, identifiers, ' +
      'punctuation — discarding whitespace and comments along the way.',
  },
  {
    kind: 'representation',
    key: 'ast',
    label: 'AST',
    view: 'tree',
    description:
      'The parser assembles the token stream into a tree that mirrors the program’s grammar: ' +
      'expressions nested inside statements, statements nested inside declarations.',
  },
  {
    kind: 'representation',
    key: 'hir',
    label: 'HIR',
    view: 'tree',
    description:
      'A typed, desugared tree. Surface syntax is gone and every node now carries the type the ' +
      'checker resolved for it, but control flow is still expressed structurally, not as jumps.',
  },
  {
    kind: 'representation',
    key: 'ir',
    label: 'IR',
    view: 'code',
    description:
      'A flat, linear instruction sequence with explicit labels and branches — the tree shape ' +
      'is gone, replaced by a straight-line list of instructions a machine could plausibly execute.',
  },
  {
    kind: 'representation',
    key: 'ssa',
    label: 'SSA',
    view: 'code',
    description:
      'The same instructions, split into basic blocks with explicit control-flow edges. Every ' +
      'value is defined exactly once; where two paths merge, a phi node picks the right one.',
  },
  {
    kind: 'transform',
    key: 'sccp',
    label: 'SCCP',
    appliesTo: 'ssa',
    description:
      'Sparse Conditional Constant Propagation folds constant arithmetic, resolves branches whose ' +
      'condition it can prove at compile time, and removes the blocks that become unreachable as a result.',
  },
  {
    kind: 'transform',
    key: 'dce',
    label: 'DCE',
    appliesTo: 'ssa',
    description:
      'Dead Code Elimination removes instructions whose results are never used and have no side ' +
      'effects — exactly what SCCP’s folding tends to leave behind.',
  },
];

export function stageIndex(key: StageKey): number {
  return STAGES.findIndex((s) => s.key === key);
}

export function stageByKey(key: StageKey): Stage {
  const stage = STAGES.find((s) => s.key === key);
  if (!stage) throw new Error(`Unknown stage: ${key}`);
  return stage;
}
