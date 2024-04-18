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
      'actions-popover-menu-item': '15px',
    },
    fontFamily: {
      'common': ['Satoshi Variable', 'Variable'],
      'time': ['Hind', 'Variable']
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
      minHeight: {
        'chat-input-mobile': '19px',
        'chat-input': '60px',
      },
      width: {
        'md': '15rem',
        'lg': '21.25rem',
        '2xl': '27.5rem',
        'page': 'calc(100% - var(--sidebar-width))',
        'thumbnail': '5rem',
        'actions-popover': '203px',
      },
      height: {
        mobile: '3.125rem',
        'menu-title-mobile': '3rem',
        'thumbnail': '5rem',
        'chat-input-mobile': '19px',
        'chat-input': '60px',
      },
      flexBasis: {
        'sidebar': 'var(--sidebar-width)',
        'page': 'calc(100% - var(--sidebar-width))',
      },
      spacing: {
        'chat-header-gap': '0.625rem',
      },
      backgroundImage: {
        'message-bg': 'linear-gradient(259deg, #9786FF 8.42%, #4A5CFF 90.13%)',
        'thumbnail-mask': 'linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)',
      },
      transitionProperty: {
        'time': 'all ease 0.6s',
        'message': 'all ease 0.3s',
      },
      maxWidth: {
        'message-width': 'var(--max-message-width, 80%)'
      },
      backgroundColor: {
        'select-btn': 'rgba(0, 0, 0, 0.05)',
        'chat-actions-popover-color': 'var(--tip-popover-color)',
        'chat-panel': 'var(--chat-panel-bg)',
      },
      boxShadow: {
        'btn': '0px 4px 10px 0px rgba(60, 68, 255, 0.14)',
        'chat-input': '0px 4px 20px 0px rgba(60, 68, 255, 0.13)',
        'actions-popover': '0px 14px 40px 0px rgba(0, 0, 0, 0.12)',
        'actions-bar': '0px 4px 30px 0px rgba(0, 0, 0, 0.10)',
      }
    },
    borderRadius: {
      'none': '0',
      'sm': '0.125rem',
      DEFAULT: '0.25rem',
      'md': '0.75rem',
      'lg': '1rem',
      'user-message': '16px 4px 16px 16px',
      'bot-message': '4px 16px 16px 16px',
      'action-btn': '0.5rem',
      'actions-bar-btn': '0.375rem',
      'chat-input': '0.5rem',
      'chat-img': '0.5rem',
    },
    borderWidth: {
      DEFAULT: '1px',
      '0': '0',
      '2': '2px',
      '3': '3px',
      '4': '4px',
      '6': '6px',
      '8': '8px',
      'actions-popover': '1px',
    },
  },
  plugins: [],
}

