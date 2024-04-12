/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      sm: '0.75rem',
      'sm-mobile': '0.875rem',
      'sm-title': '0.875rem',
    },
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1120px',
      xl: '1440px',
      '2xl': '1980px'
    },
    // spacing: Array.from({ length: 1000 }).reduce((map, _, index) => {
    //   map[index] = `${index}rem`;
    //   return map;
    // }, {}),
    extend: {
      width: {
        'md': '15rem',
        'lg': '21.25rem',
        '2xl': '27.5rem',
      }
    },
    borderRadius: {
      'none': '0',
      'sm': '0.125rem',
      DEFAULT: '0.25rem',
      'md': '0.75rem',
      'lg': '1rem',
    }
  },
  plugins: [],
}

