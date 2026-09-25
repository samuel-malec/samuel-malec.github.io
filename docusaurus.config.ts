import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Samuel Malec',
  tagline: 'Compiler engineering · Programming languages · Static analysis',
  favicon: 'img/favicon.ico',

  url: 'https://samuel-malec.github.io',
  baseUrl: '/',

  organizationName: 'samuel-malec',
  projectName: 'samuel-malec.github.io',

  onBrokenLinks: 'throw',

  presets: [
    [
      'classic',
      {
        docs: false,

        blog: {
          showReadingTime: true,
          blogTitle: 'Blog',
          blogDescription:
            'Notes on compilers, intermediate representations, optimisation passes and static analysis.',
          blogSidebarTitle: 'Posts',
          blogSidebarCount: 'ALL',
          feedOptions: {
            type: 'all',
            title: 'Samuel Malec — Blog',
            description:
              'Notes on compilers, intermediate representations, optimisation passes and static analysis.',
            xslt: true,
          },
        },

        theme: {
          customCss: './src/css/custom.css',
        },

        sitemap: {
          changefreq: 'monthly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // TODO: add a 1200x630 Open Graph card to static/img/ and set `image` to it,
    // e.g. image: 'img/og-card.png'. Until then pages fall back to text-only previews.

    navbar: {
      title: 'Samuel Malec',
      hideOnScroll: false,
      items: [
        {to: '/', label: 'Home', position: 'left', activeBaseRegex: '^/$'},
        {to: '/projects', label: 'Projects', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/about', label: 'About', position: 'left'},
      ],
    },

    footer: {
      style: 'light',
      links: [
        {
          title: 'Site',
          items: [
            {to: '/projects', label: 'Projects'},
            {to: '/blog', label: 'Blog'},
            {to: '/about', label: 'About / CV'},
            {to: '/reading', label: 'Reading list'},
          ],
        },
        {
          title: 'Contact',
          items: [
            {href: 'mailto:malec293@gmail.com', label: 'malec293@gmail.com'},
            {href: 'https://github.com/samuel-malec', label: 'GitHub'},
            {
              href: 'https://linkedin.com/in/samuelmalec-7ba7b8238',
              label: 'LinkedIn',
            },
          ],
        },
        {
          title: 'Feeds',
          items: [
            // pathname:// keeps these out of the SPA router and out of the
            // broken-link check: the feeds are emitted after the link check runs.
            {to: 'pathname:///blog/rss.xml', label: 'RSS'},
            {to: 'pathname:///blog/atom.xml', label: 'Atom'},
          ],
        },
      ],
      copyright: `Samuel Malec, Brno. Built with Docusaurus. Opinions here are my own and do not represent my employer.`,
    },

    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  },

  headTags: [
    {
      tagName: 'meta',
      attributes: {name: 'author', content: 'Samuel Malec'},
    },
  ],
};

export default config;
