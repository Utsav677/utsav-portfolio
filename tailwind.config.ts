import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
      },
      colors: {
        amber: {
          DEFAULT: '#e8a020',
          bright:  '#ffcc60',
          mid:     '#c88818',
          dim:     '#7a5010',
          dimmer:  '#3d2808',
          err:     '#cc4400',
          ok:      '#88bb22',
          info:    '#4488cc',
        },
        bg: {
          DEFAULT: '#060401',
          panel:   '#0a0700',
        },
      },
    },
  },
  plugins: [],
};

export default config;
