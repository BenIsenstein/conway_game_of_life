/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        cursor: {
          '0%': { backgroundColor: 'rgb(239 68 68)' }
        }
      },
      animation: {
        cursor: 'cursor 1s steps(2) infinite'
      }
    }
  },
  plugins: []
}
