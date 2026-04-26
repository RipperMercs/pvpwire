import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Editorial color system, defined as CSS variables for theming.
        // Theme switching toggles the variables on the <html> element.
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        'paper-elev': 'rgb(var(--color-paper-elev) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        rule: 'rgb(var(--color-rule) / <alpha-value>)',
        wash: 'rgb(var(--color-wash) / <alpha-value>)',
        signal: 'rgb(var(--color-signal) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '68ch',
          },
        },
      },
      maxWidth: {
        'col': '68ch',
        'col-wide': '78ch',
        'page': '1280px',
      },
      gridTemplateColumns: {
        'masthead': 'minmax(0, 1fr) 320px',
      },
    },
  },
  plugins: [],
};

export default config;
