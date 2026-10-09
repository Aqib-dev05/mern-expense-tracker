/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Cobalt brand colour (kept separate from income green / expense rose, which only ever mean money)
        brand: {
          50: '#eef3ff', 100: '#dde7ff', 200: '#c0d1ff', 300: '#94b0ff', 400: '#6283fb',
          500: '#3f5df0', 600: '#2f45dc', 700: '#2735b8', 800: '#252f94', 900: '#232d75',
        },
        // Blue-tinted dark surfaces
        ink: { 950: '#0a0f1e', 900: '#101831', 800: '#1a2444', 700: '#27345c' },
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.05)',
      },
    },
  },
  plugins: [],
};
