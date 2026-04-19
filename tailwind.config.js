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
          primary: '#FF6B6B',
          secondary: '#A364FF',
          accent: '#FFB86C',
          light: '#FFDAB9',
          subtle: '#FFF5F0',
          blue: '#4DACFF',
          mint: '#50FA7B',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
            950: '#030712',
          }
        },
        'apple-black': '#000000',
        'apple-card': '#121212',
        'apple-elevated': '#1C1C1E',
        'apple-border': '#2C2C2E',
        'apple-separator': '#3A3A3C',
        'apple-secondary': '#8E8E93',
        'apple-primary': '#FF6B6B',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0,0,0,0.04)',
        'float': '0 20px 40px rgba(0,0,0,0.08)',
        'premium': '0 10px 40px -10px rgba(0,0,0,0.1), 0 24px 80px -20px rgba(0,0,0,0.1)',
        'glow-primary': '0 0 20px rgba(255,107,107,0.4)',
        'glow-secondary': '0 0 20px rgba(163,100,255,0.4)',
        'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.6)',
        'inner-dark': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
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
