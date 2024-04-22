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
      'setting-title': '1.25rem',
      'setting-items': '1rem',
    },
    fontWeight: {
      'setting-title': '700',
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
    extend: {
      backdropBlur: {
        'chat-header': '20px',
      },
      minHeight: {
        'chat-input-mobile': '19px',
        'chat-input': '60px',
      },
      width: {
        'md': '15rem',
        'lg': '21.25rem',
        '2xl': '27.5rem',
        'page': 'calc(100% - var(--menu-width))',
        'thumbnail': '5rem',
        'actions-popover': '203px',
      },
      height: {
        mobile: 'var(--siderbar-mobile-height)',
        // mobile: '3.125rem',
        'menu-title-mobile': '3rem',
        'thumbnail': '5rem',
        'chat-input-mobile': '19px',
        'chat-input': '60px',
        'chat-panel-mobile': '- var(--siderbar-mobile-height)',
        'setting-panel-mobile': 'calc(100vh - var(--siderbar-mobile-height))',
      },
      flexBasis: {
        'sidebar': 'var(--menu-width)',
        'page': 'calc(100% - var(--menu-width))',
        'message-width': 'var(--max-message-width)',
      },
      spacing: {
        'chat-header-gap': '0.625rem',
        'chat-panel-mobile': 'var(--siderbar-mobile-height)',
        'message-img': 'calc((100%- var(--img-gap-count)*0.25rem)/var(--img-count))',
      },
      backgroundImage: {
        'message-bg': 'linear-gradient(259deg, #9786FF 8.42%, #4A5CFF 90.13%)',
        'thumbnail-mask': 'linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)',
      },
      transitionProperty: {
        'time': 'all ease 0.6s',
        'message': 'all ease 0.3s',
      },
      maxHeight: {},
      maxWidth: {
        'message-width': 'var(--max-message-width)',
      },
      backgroundColor: {
        'select-btn': 'rgba(0, 0, 0, 0.05)',
        'chat-actions-popover-color': 'var(--tip-popover-color)',
        'chat-panel': 'var(--chat-panel-bg)',
        'global': '#E3E3ED',
      },
      boxShadow: {
        'btn': '0px 4px 10px 0px rgba(60, 68, 255, 0.14)',
        'chat-input': '0px 4px 20px 0px rgba(60, 68, 255, 0.13)',
        'actions-popover': '0px 14px 40px 0px rgba(0, 0, 0, 0.12)',
        'actions-bar': '0px 4px 30px 0px rgba(0, 0, 0, 0.10)',
        'prompt-hint-container': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)'
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

