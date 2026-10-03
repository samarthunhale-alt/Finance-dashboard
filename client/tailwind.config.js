/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
      colors: {
        ink: { DEFAULT: '#17211F', soft: '#51605B', faint: '#8A9792' },
        paper: '#F4F6F2',
        line: '#DCE2DC',
        mist: '#EAEFEA',
        pine: { DEFAULT: '#14594A', dark: '#0C3F34', deep: '#0A2F27', light: '#E3F0EA' },
        brick: { DEFAULT: '#B8432B', light: '#F8E8E3' },
        amber: { DEFAULT: '#A8710F', light: '#F9F0DA' },
      },
    },
  },
  plugins: [],
};
