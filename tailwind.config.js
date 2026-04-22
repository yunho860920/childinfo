/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F04452', // Sophisticated Toss-style Red
          secondary: '#3182F6', // Keep blue as secondary for balance
          accent: '#FFB86C',
          light: '#FFF0F0',
          subtle: '#F9FAFB',
          blue: '#3182F6',
          mint: '#00D084',
          gray: {
            50: '#F2F4F6',
            100: '#E5E8EB',
            200: '#D1D6DB',
            300: '#B0B8C1',
            400: '#8B95A1',
            500: '#6B7684',
            600: '#4E5968',
            700: '#333D4B',
            800: '#191F28',
            900: '#101419',
            950: '#000000',
          }
        },
        'apple-black': '#000000',
        'apple-card': '#FFFFFF',
        'apple-elevated': '#F2F4F6',
        'apple-border': '#E5E8EB',
        'apple-separator': '#F2F4F6',
        'apple-secondary': '#8B95A1',
        'apple-primary': '#F04452',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0,0,0,0.02)',
        'card': '0 8px 24px rgba(0,0,0,0.04)',
        'float': '0 12px 32px rgba(0,0,0,0.08)',
        'premium': '0 20px 40px -12px rgba(0,0,0,0.1)',
        'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },
      fontFamily: {
        pretendard: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-aurora': 'linear-gradient(135deg, #FF6B6B 0%, #A364FF 50%, #4DACFF 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF6B6B 0%, #FFB86C 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'aurora': 'aurora 60s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        aurora: {
          '0%': { backgroundPosition: '50% 50%, 50% 50%' },
          '100%': { backgroundPosition: '350% 50%, 350% 50%' },
        }
      }
    },
  },
  plugins: [],
}
