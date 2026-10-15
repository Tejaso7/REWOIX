/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rewoix: {
          bg: '#0B0F17',
          surface: '#111827',
          card: '#1E293B',
          cyan: '#00D2FF',
          blue: '#3B82F6',
          emerald: '#10B981',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        accent: {
          400: '#38bdf8',
          500: '#00D2FF',
          600: '#2563eb',
        },
        dark: {
          800: '#1E293B',
          850: '#111827',
          900: '#0B0F17',
        }
      },
    },
  },
  plugins: [],
}
