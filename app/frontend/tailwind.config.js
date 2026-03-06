/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#8B0000',  // Changed from blue to JIBCA burgundy
          600: '#6B0000',  // Changed from blue to JIBCA burgundy pressed
          700: '#5B0000',
          800: '#4B0000',
          900: '#3B0000',
        },
        jibca: {
          // JIBCA Browns (Backgrounds)
          darkBrown: '#2D1810',
          darkerBrown: '#1A0F0A',
          
          // JIBCA Golds (Accents & Highlights)
          gold: '#D4C4B0',
          goldLight: '#E8DCC8',
          goldDark: '#B8A890',
          
          // JIBCA Burgundy (Primary Actions)
          burgundy: '#8B0000',
          burgundyHover: '#A52A2A',
          burgundyPressed: '#6B0000',
          
          // Functional colors (keep for event types and status)
          green: '#10B981',
          yellow: '#F59E0B',
          purple: '#8B5CF6',
          red: '#EF4444',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}