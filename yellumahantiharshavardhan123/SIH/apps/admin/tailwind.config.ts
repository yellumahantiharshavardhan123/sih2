import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0ea5e9',
          dark: '#0369a1'
        },
        risk: {
          low: '#16a34a',
          medium: '#f59e0b',
          high: '#f97316',
          restricted: '#ef4444'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
