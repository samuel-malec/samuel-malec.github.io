export type Project = {
  /** Route of the project page; must match the .mdx filename under src/pages/projects/. */
  href: string;
  title: string;
  description: string;
  links: {label: string; href: string}[];
};

export const projects: Project[] = [
  {
    href: '/projects/compiler-dungeon',
    title: 'Compiler Dungeon',
    description: 'A hands-on educational compiler for a custom language.',
    links: [
      {
        label: 'github.com/samuel-malec/compiler-dungeon',
        href: 'https://github.com/samuel-malec/compiler-dungeon',
      },
      {label: 'Blog post', href: '/blog/2026/09/03/compiler-dungeon/intro'},
    ],
  },
  {
    href: '/projects/dagon',
    title: 'Dagon',
    description: 'Designing and developing an IR for static analysis.',
    links: [
      {
        label: 'github.com/samuel-malec/dagon',
        href: 'https://github.com/samuel-malec/dagon',
      },
      {label: 'Blog post', href: '/blog/2026/09/13/qthu/intro'},
    ],
  },
  {
    href: '/projects/abstract-interpretation-graalvm',
    title: 'Abstract interpretation for GraalVM Native Image',
    description: 'Abstract interpretation framework for GraalVM Native Image.',
    links: [
      {label: 'github.com/S3MU1L/graal', href: 'https://github.com/S3MU1L/graal'},
    ],
  },
];
