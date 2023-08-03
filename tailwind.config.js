/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        red: '#FF033E',
        blue: '#3E03FF',
        white: '#FFFFFF',
        black: '#000000',
        gray: '#585858',
        lightGray: '#9c9c9c',
        opaque: '#00FF0080',
        green: '#006442',
      },
    },
  },
  plugins: [],
};
