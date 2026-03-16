/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        bg: '#000000',
        surface: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        'text-primary': '#f0f0f0',
        'text-secondary': '#aaa',
        'text-muted': '#555',
      },
      animation: {
        'fade-in':  'fadeIn 0.35s ease-out both',
        'slide-up': 'slideUp 0.3s ease-out both',
        'orb-breathe': 'orbBreathe 3s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
