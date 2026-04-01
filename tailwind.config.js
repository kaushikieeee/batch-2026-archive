/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'bg-primary':    '#111112',
        'bg-secondary':  '#1a1a1c',
        'bg-tertiary':   '#222226',
        'accent-yellow': '#F4C430',
        'soft-yellow':   '#FFD95A',
        'text-primary':  '#EAEAEA',
        'muted':         '#777780',
      },
      fontFamily: {
        'archive':     ['"DM Serif Display Local"','"Cormorant Garamond"','Georgia','serif'],
        'display':     ['"Cormorant Garamond"','"Playfair Display"','Georgia','serif'],
        'body':        ['"Manrope"','sans-serif'],
        'mono':        ['"Space Mono"','monospace'],
        'handwritten': ['"Caveat"','"Segoe Print"','cursive'],
      },
      borderRadius: { pill: '999px' },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
