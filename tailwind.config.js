/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0D1B4B',
        accent: '#00C853',
        teal: '#00897B',
        slate: '#F0F4FF',
      },
      borderRadius: {
        'accretio': '12px',
        'accretio-lg': '16px',
      },
    },
  },
  plugins: [],
};
