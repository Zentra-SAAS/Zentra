/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#004AAD',
          600: '#003d91',
          700: '#003275',
        },
        secondary: {
          50: '#F7F7F7',
          100: '#EEEEEE',
        },
        text: {
          primary: '#222222',
          secondary: '#666666',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};