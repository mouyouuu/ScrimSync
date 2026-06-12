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
        // Accent
        accent: {
          DEFAULT: '#6C5CE7',
          hover: '#5A4BD1',
          muted: '#2d2562',
          subtle: '#1a1540',
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
        DEFAULT: '10px',
        'md': '12px',
        'lg': '16px',
        'xl': '18px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.5)',
        DEFAULT: '0 4px 16px rgba(0,0,0,0.4)',
        'md': '0 8px 24px rgba(0,0,0,0.5)',
        'lg': '0 20px 48px rgba(0,0,0,0.6)',
        'accent': '0 0 0 1px rgba(108,92,231,0.4), 0 4px 20px rgba(108,92,231,0.2)',
        'card': '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
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
