import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      /*
       * Named for the job, not the pixel size, so a heading cannot be set two
       * steps too small by picking `text-2xl` off the default ramp. Leading and
       * tracking travel with the size: display type needs negative tracking to
       * stop looking gappy, body copy needs the opposite of tight leading.
       */
      fontSize: {
        micro: ['var(--step-000)', { lineHeight: '1.45', letterSpacing: '0.02em' }],
        meta: ['var(--step-00)', { lineHeight: '1.5' }],
        body: ['var(--step-0)', { lineHeight: '1.65' }],
        'body-lg': ['var(--step-1)', { lineHeight: '1.6' }],
        lede: ['var(--step-2)', { lineHeight: '1.45', letterSpacing: '-0.01em' }],
        h3: ['var(--step-3)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        h2: ['var(--step-4)', { lineHeight: '1.06', letterSpacing: '-0.022em' }],
        h1: ['var(--step-5)', { lineHeight: '1.0', letterSpacing: '-0.028em' }],
        display: ['var(--step-6)', { lineHeight: '0.92', letterSpacing: '-0.038em' }],
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
      colors: {
        groove: {
          gold: '#C9A84C',
          'gold-light': '#E8D5B7',
          'gold-dark': '#A87D2A',
          black: '#1a1816',
          dark: '#22201d',
          'dark-2': '#2c2925',
          gray: '#3c3832',
          silver: '#9c968a',
        },
      },
    },
  },
  plugins: [],
}

export default config
