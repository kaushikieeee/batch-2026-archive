/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1A1A1A',
        'bg-secondary': '#222222',
        'accent-yellow': '#F4C430',
        'soft-yellow': '#FFD95A',
        'text-primary': '#EAEAEA',
        'muted': '#888888',
      },
      fontFamily: {
        'display': ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        'body': ['"Manrope"', 'sans-serif'],
        'mono': ['"Space Mono"', 'monospace'],
      },
      animation: {
        'grain': 'grain 8s steps(10) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 20px rgba(244, 196, 48, 0.5)' },
          '50%': { textShadow: '0 0 40px rgba(244, 196, 48, 0.9), 0 0 80px rgba(244, 196, 48, 0.4)' },
        },
      },
      backgroundImage: {
        'radial-yellow': 'radial-gradient(ellipse at center, rgba(244,196,48,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
