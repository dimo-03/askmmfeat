/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF2F9',
          100: '#D5DEEE',
          200: '#A9B9DA',
          300: '#7C94C6',
          400: '#4F6FB0',
          500: '#123A78',
          600: '#0F3166',
          700: '#0C2855',
          800: '#0A1F45',
          900: '#0B1F4D',
          950: '#061330',
        },
        gold: {
          50: '#FDF8E8',
          100: '#FBEEC4',
          200: '#F7DE8E',
          300: '#F2CB57',
          400: '#E8B418',
          500: '#DFA500',
          600: '#B88500',
          700: '#8F6700',
        },
        brand: {
          green: '#287A36',
          greenSoft: '#E6F2E8',
        },
        mist: '#F3F6FB',
        ink: '#263238',
        muted: '#64748B',
      },
      fontFamily: {
        heading: ['Merriweather', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 31, 77, 0.06), 0 8px 24px rgba(11, 31, 77, 0.08)',
        lift: '0 2px 4px rgba(11, 31, 77, 0.08), 0 18px 40px rgba(11, 31, 77, 0.16)',
      },
    },
  },
  plugins: [],
};
