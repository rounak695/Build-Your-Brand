/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#1F1F1F',
        secondary: '#505050',
        muted: '#929292',
        light: '#C1C1C1',
        border: '#E5E5E5',
        panel: '#F1F1F1',
        bg: '#FCFBFB',
        accent: '#B20606',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
