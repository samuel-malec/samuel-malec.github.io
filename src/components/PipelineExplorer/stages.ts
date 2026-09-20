// A single source of truth for every pipeline stage the explorer knows about.
// Adding a new representation or transformation pass means adding one entry
// here — the navigation, the step-through counter, and the output view all
// derive from this list rather than hardcoding a UI per stage.

export type RepresentationKey = 'tokens' | 'ast' | 'hir' | 'ir' | 'ssa';
export type TransformKey = 'sccp' | 'dce' | 'simplify_cfg';
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
    description:
      'Sparse Conditional Constant Propagation folds constant arithmetic and resolves branches ' +
      'whose condition it can prove at compile time — it doesn’t clean up afterwards, that’s the ' +
      'next two passes’ job.',
  },
  {
    kind: 'transform',
    key: 'dce',
    label: 'DCE',
    description:
      'Dead Code Elimination removes instructions whose results are never used and have no side ' +
      'effects — exactly what SCCP’s folding tends to leave behind.',
  },
  {
    kind: 'transform',
    key: 'simplify_cfg',
    label: 'SimplifyCFG',
    description:
      'Cleans up the control-flow graph structurally: deletes blocks nothing can reach anymore, ' +
      'merges a block into its sole predecessor when that’s safe, and collapses phi nodes left ' +
      'with only one incoming value.',
  },
];

// The real pipeline's fixed transform order (sccp, then dce, then simplify_cfg) — derived from
// STAGES itself rather than duplicated, so reordering or adding a transform there is the only
// place that needs to change.
export const TRANSFORM_ORDER: TransformKey[] = STAGES.filter(
  (s): s is TransformStage => s.kind === 'transform',
).map((s) => s.key);

export function stageIndex(key: StageKey): number {
  return STAGES.findIndex((s) => s.key === key);
}

export function stageByKey(key: StageKey): Stage {
  const stage = STAGES.find((s) => s.key === key);
  if (!stage) throw new Error(`Unknown stage: ${key}`);
  return stage;
}
