/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        paper: '#f6f4ef',
        surface: '#fffdf9',
        ink: '#1c1b19',
        muted: '#8b877e',
        hairline: '#e5e0d6'
      }
    }
  },
  plugins: []
};
