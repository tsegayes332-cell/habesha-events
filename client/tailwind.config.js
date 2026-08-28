/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4A843',
        espresso: '#1A0A00',
        terracotta: '#C4622D',
        cream: '#F5ECD7',
        forest: '#2D5A3D',
        'ethiopian-red': '#B91C1C',
        'card-bg': '#2A1200',
        primary: {
          500: '#D4A843',
          600: '#B88D2F',
        }
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        ethiopic: ['Noto Sans Ethiopic', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(212,168,67,0.12)',
      }
    },
  },
  plugins: [],
}
