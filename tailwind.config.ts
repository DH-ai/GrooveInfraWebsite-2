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
      colors: {
        groove: {
          gold: '#C9A84C',
          'gold-light': '#E8D5B7',
          'gold-dark': '#A87D2A',
          black: '#080808',
          dark: '#111111',
          'dark-2': '#181818',
          gray: '#222222',
          silver: '#888888',
          // test-1 exploration: terracotta/copper accent
          copper: '#C4622D',
          'copper-light': '#E8A882',
          'copper-dark': '#9A3E18',
          navy: '#080C14',
          'navy-surface': '#0D1220',
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 20px 60px rgba(0, 0, 0, 0.5)',
        gold: '0 0 24px rgba(201, 168, 76, 0.2)',
        'gold-hover': '0 0 48px rgba(201, 168, 76, 0.35)',
        copper: '0 0 24px rgba(196, 98, 45, 0.25)',
        'copper-hover': '0 0 48px rgba(196, 98, 45, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
