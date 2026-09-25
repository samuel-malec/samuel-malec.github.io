/**
 * Single source of truth for the project list shown on the home page and on
 * /projects. Each entry links to its own page under src/pages/projects/.
 */

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  /** Route of the project page. */
  href: string;
  title: string;
  /** Where the work happens: affiliation, or "personal". */
  context: string;
  period: string;
  /** One or two sentences, reused verbatim on the home page and /projects. */
  summary: string;
  /** Technical identifiers, rendered in monospace. */
  topics: string[];
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    href: '/projects/abstract-interpretation-graalvm',
    title: 'Abstract interpretation for GraalVM Native Image',
    context: 'FI MUNI with Oracle Labs',
    period: '2024 – present',
    summary:
      'A framework for abstract interpretation that works directly on Native Image’s ' +
      'Sea-of-Nodes IR: extensible abstract domains, worklist-based fixpoint iteration ' +
      'with widening, and integration into the Native Image compilation pipeline.',
    topics: ['Sea-of-Nodes', 'abstract domains', 'widening', 'interprocedural'],
    links: [
      {label: 'github.com/S3MU1L/graal', href: 'https://github.com/S3MU1L/graal'},
    ],
  },
  {
    href: '/projects/compiler-dungeon',
    title: 'Compiler Dungeon',
    context: 'Personal',
    period: '',
    summary:
      'An educational and experimental optimising compiler in C++, from parsing and ' +
      'bidirectional type inference through HIR, three-address code, CFG and SSA to ' +
      'optimisation passes such as SCCP and DCE.',
    topics: ['C++', 'SSA', 'three-address code', 'SCCP', 'DCE'],
    links: [
      {
        label: 'Blog: Compiler Dungeon',
        href: '/blog/2026/09/03/compiler-dungeon/intro',
      },
    ],
  },
  {
    href: '/projects/dagon',
    title: 'Dagon — JavaScript to QuickJS bytecode via Cthulhu',
    context: 'Faculty-funded compiler/IR project',
    period: '',
    summary:
      'A compiler from a subset of JavaScript to the Cthulhu intermediate language, a ' +
      'lowering from Cthulhu to QuickJS bytecode, and a runtime path that loads and ' +
      'executes the generated QuickJS modules.',
    topics: ['Cthulhu', 'Single Static Use', 'QuickJS bytecode', 'lowering'],
    links: [
      {
        label: 'github.com/samuel-malec/dagon',
        href: 'https://github.com/samuel-malec/dagon',
      },
      {label: 'Blog: Dagon', href: '/blog/2026/09/13/qthu/intro'},
    ],
  },
];
