/**
 * The project list, used by the home page and /projects.
 *
 * Only the identity of each project is filled in here — name, where it lives,
 * and the links. Everything descriptive is a placeholder on the page itself
 * (see src/pages/projects/*.mdx), so nothing here speaks for you.
 *
 * To add a project: add an entry, then create src/pages/projects/<slug>.mdx.
 */

export type Project = {
  /** Route of the project page; must match the .mdx filename under src/pages/projects/. */
  href: string;
  title: string;
  links: {label: string; href: string}[];
};

export const projects: Project[] = [
  {
    href: '/projects/abstract-interpretation-graalvm',
    title: 'Abstract interpretation for GraalVM Native Image',
    links: [
      {label: 'github.com/S3MU1L/graal', href: 'https://github.com/S3MU1L/graal'},
    ],
  },
  {
    href: '/projects/compiler-dungeon',
    title: 'Compiler Dungeon',
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
    links: [
      {
        label: 'github.com/samuel-malec/dagon',
        href: 'https://github.com/samuel-malec/dagon',
      },
      {label: 'Blog post', href: '/blog/2026/09/13/qthu/intro'},
    ],
  },
];
