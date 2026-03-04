/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        romance: {
          50: '#FFF5F7',
          100: '#FFEBEF',
          200: '#FFD6DE',
          300: '#FFB3C1',
          400: '#FF8FA3',
          500: '#FF6B85',
          600: '#E84766',
          700: '#C4314F',
          800: '#9E2742',
          900: '#7A1F36',
        },
        parchment: {
          50: '#FFFDF7',
          100: '#FFF8E7',
          200: '#FFF1CC',
          300: '#FFE8A8',
          400: '#FFD97A',
          500: '#FFC94C',
        },
        ink: {
          50: '#F5F3F0',
          100: '#E8E4DD',
          200: '#D1C9BC',
          300: '#B5A998',
          400: '#9A8E7A',
          500: '#7A6E5A',
          600: '#5E5345',
          700: '#4A3F33',
          800: '#362D24',
          900: '#231E17',
        }
      },
      fontFamily: {
        'serif-vn': ['Georgia', 'Palatino', '"Times New Roman"', 'serif'],
        'sans-vn': ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'petal-fall': 'petalFall 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        petalFall: {
          '0%': { transform: 'translateY(-10%) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};