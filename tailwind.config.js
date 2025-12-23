/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 深海主题色
        abyss: {
          50: '#e6f7ff',
          100: '#b3e7ff',
          200: '#80d8ff',
          300: '#4dc9ff',
          400: '#1abaff',
          500: '#00a0e6',
          600: '#007db3',
          700: '#005a80',
          800: '#00374d',
          900: '#00141a',
          950: '#000a0d',
        },
        // 业力值颜色
        karma: {
          gluttony: '#dc2626', // 暴食 - 红
          greed: '#f59e0b',    // 贪婪 - 金
          mercy: '#22c55e',    // 慈悲 - 绿
        },
        // 天气主题色
        weather: {
          sunny: '#fef08a',
          bloodRain: '#7f1d1d',
          fog: '#6b7280',
        },
      },
      fontFamily: {
        title: ['"Noto Serif SC"', 'serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
        mystical: ['"Ma Shan Zheng"', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'ripple': 'ripple 2s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

