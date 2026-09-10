import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#08090B',
          900: '#08090B',
          800: '#0D0F12',
          700: '#131519',
          600: '#1B1E24',
          500: '#262A31',
        },
        chalk: {
          DEFAULT: '#F3F4F6',
          muted: '#9AA0A9',
          dim: '#6B7079',
        },
        // Brand accent — the "check engine" red from the Check Engines mark.
        ignition: {
          DEFAULT: '#E22B22',
          bright: '#FF4436',
          deep: '#A81C15',
        },
        steel: '#5B6673',
        signal: {
          ready: '#4ADE80',
          due: '#F2A83B',
          inspect: '#F26D63',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        brand: '0.42em',
        wide2: '0.2em',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        'scan-y': {
          '0%': { transform: 'translateY(-120%)' },
          '100%': { transform: 'translateY(120%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.7)', opacity: '0.9' },
          '70%': { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'scan-y': 'scan-y 2.6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4,0,0.2,1) infinite',
        'fade-up': 'fade-up 0.7s ease forwards',
      },
    },
  },
  plugins: [],
};

export default config;
