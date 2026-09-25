import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'ZJBlog',
  tagline: 'Samuel Malec',
  favicon: 'img/favicon.png',

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
        },

        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // Notes: a second blog instance, for short-form writing kept separate from
    // the long-form posts in /blog.
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'notes',
        routeBasePath: 'notes',
        path: './notes',
        blogTitle: 'Notes',
        blogSidebarTitle: 'Notes',
        showReadingTime: false,
        onUntruncatedBlogPosts: 'ignore',
        feedOptions: {type: 'all'},
      },
    ],
    // Feeds the home page's "Latest" list from blog/ and notes/, so there is
    // no hand-maintained list to keep in sync.
    [
      './src/plugins/recent-writing.js',
      {
        limit: 5,
        sources: [
          {dir: 'blog', routeBasePath: '/blog', label: 'blog'},
          {dir: 'notes', routeBasePath: '/notes', label: 'note'},
        ],
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'ZJBlog',
      items: [
        {
          to: '/',
          label: 'Home',
          position: 'left',
        },
        {
          to: '/projects',
          label: 'Projects',
          position: 'left',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'left',
        },
        {
          to: '/notes',
          label: 'Notes',
          position: 'left',
        },
        {
          to: '/reading',
          label: 'Reading',
          position: 'left',
        },
        {
          to: '/about',
          label: 'About',
          position: 'left',
        },
      ],
    },

    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  },
};

export default config;
