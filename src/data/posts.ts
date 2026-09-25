/**
 * Posts highlighted on the home page.
 *
 * The blog itself is generated from blog/ by the Docusaurus blog plugin; this
 * list only controls what the home page points at. Add new posts here (newest
 * first) when they should show up on the front page — the build fails on a
 * wrong href, since onBrokenLinks is set to 'throw'.
 */

export type PostLink = {
  title: string;
  href: string;
  /** Display date, matching the post's date in the blog. */
  date: string;
};

export const recentPosts: PostLink[] = [
  {
    title: 'Dagon',
    href: '/blog/2026/09/13/qthu/intro',
    date: '13 September 2026',
  },
  {
    title: 'Compiler Dungeon',
    href: '/blog/2026/09/03/compiler-dungeon/intro',
    date: '3 September 2026',
  },
  {
    title: 'Side-Effect Analysis',
    href: '/blog/2026/08/17/diplomka/proposal',
    date: '17 August 2026',
  },
];
