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
      'sm-mobile-tab': '0.625rem',
      'chat-header-title': '1rem',
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
      },
      height: {
        mobile: '3.125rem',
        'menu-title-mobile': '3rem',
      },
      flexBasis: {
        'sidebar': 'var(--sidebar-width)',
        'page': 'calc(100%-var(--sidebar-width))',
      },
      spacing: {
        'chat-header-gap': '0.625rem',
      },
      backgroundImage: {
        'message-bg': 'linear-gradient(259deg, #9786FF 8.42%, #4A5CFF 90.13%)',
      },
      transitionProperty: {
        'time': 'all ease 0.6s',
        'message': 'all ease 0.3s',
      },
      maxWidth: {
        'message-width': 'var(--max-message-width, 70%)'
      },
      backgroundColor: {
        'select-btn': 'rgba(0, 0, 0, 0.05)',
      }
    },
    borderRadius: {
      'none': '0',
      'sm': '0.125rem',
      DEFAULT: '0.25rem',
      'md': '0.75rem',
      'lg': '1rem',
      'message': '16px 4px 16px 16px',
      'action-btn': '0.5rem',
    },
    fontFamily: {
      'common': ['Satoshi Variable', 'Variable'],
      'time': ['Hind', 'Variable']
    }
  },
  plugins: [],
}

