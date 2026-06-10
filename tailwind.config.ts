import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          DEFAULT: '#09090b',
          surface: '#18181b',
          elevated: '#27272a',
          hover: '#2d2d30',
        },
        // Borders
        border: {
          DEFAULT: '#3f3f46',
          subtle: '#2a2a2e',
          strong: '#52525b',
        },
        // Text
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#71717a',
          disabled: '#52525b',
        },
        // Accent (indigo premium)
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          muted: '#312e81',
          subtle: '#1e1b4b',
          foreground: '#ffffff',
        },
        // States
        success: {
          DEFAULT: '#4ade80',
          bg: '#052e16',
          border: '#166534',
        },
        warning: {
          DEFAULT: '#fb923c',
          bg: '#1c0a00',
          border: '#7c2d12',
        },
        danger: {
          DEFAULT: '#f87171',
          bg: '#1c0505',
          border: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.5)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.4)',
        'md': '0 4px 16px rgba(0,0,0,0.5)',
        'lg': '0 8px 32px rgba(0,0,0,0.6)',
        'accent': '0 0 0 1px rgba(99,102,241,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
