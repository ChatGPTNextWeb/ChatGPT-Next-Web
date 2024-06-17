/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        ring: {
          '0%': { strokeDasharray: '0 257 0 0 1 0 0 258' },
          '25%': { strokeDasharray: '0 0 0 0 257 0 258 0' },
          '50%, 100%': { strokeDasharray: '0 0 0 0 0 515 0 0' },
        },
        ball: {
          '0%, 50%': { animationTimingFunction: 'ease-in', strokeDashoffset: '1' },
          '64%': { animationTimingFunction: 'ease-in', strokeDashoffset: '-109' },
          '78%': { animationTimingFunction: 'ease-in', strokeDashoffset: '-145' },
          '92%': { animationTimingFunction: 'ease-in', strokeDashoffset: '-157' },
          '57%, 71%, 85%, 99%, 100%': { animationTimingFunction: 'ease-out', strokeDashoffset: '-163' },
        },
      },
      animation: {
        ring: 'ring 2s ease-out infinite',
        ball: 'ball 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
