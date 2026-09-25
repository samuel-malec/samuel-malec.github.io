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
          to: '/blog',
          label: 'Blog',
          position: 'left',
        },
        {
          to: '/reading',
          label: 'Reading',
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
