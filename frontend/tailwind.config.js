/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./src/assets/config/*.json",
  ],
  theme: {
    extend: {
      colors: {
        // Etno + drvo paleta — mijenja se po klijentu kroz CSS varijable
        wood: {
          50:  '#FAF7F2',  // background
          100: '#F1E9DC',
          200: '#E2D2B8',
          300: '#CDB48C',
          400: '#B0925F',
          500: '#A1887F',  // svijetli hrast (secondary)
          600: '#8B6F47',
          700: '#5D4037',  // boja oraha (primary)
          800: '#3E2A22',
          900: '#2C1810',  // tamni tekst
        },
        forest: {
          500: '#5C7A29',
          600: '#3E5C3E',  // accent
          700: '#2D4530',
        },
        cream: '#F5E6D3',
      },
      fontFamily: {
        // Mijenja se kroz site.config.json
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'slow-zoom': 'slowZoom 20s ease-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
      },
      backgroundImage: {
        'wood-texture': "url('/assets/images/wood-texture.jpg')",
        'hero-gradient': 'linear-gradient(135deg, rgba(44,24,16,0.85) 0%, rgba(93,64,55,0.7) 100%)',
      },
    },
  },
  plugins: [],
}
