// eslint.config.js
import antfu from '@antfu/eslint-config';

export default await antfu({
  ignores: [
    'pnpm-lock.yaml',
    'public/serviceWorker.js', // 保持现有配置逻辑
  ],
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: 'always',
  },
  formatters: {
    prettierOptions: {
      tabWidth: 2,
      useTabs: false,
      trailingComma: 'all',
      singleQuote: false,
      semi: true,
    },
    /**
     * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
     * By default uses Prettier
     */
    css: true,
    /**
     * Format HTML files
     * By default uses Prettier
     */
    html: true,
    /**
     * Format Markdown files
     * Supports Prettier and dprint
     * By default uses Prettier
     */
    markdown: 'prettier',
  },
  typescript: true,
  vue: true,
  react: true,
  rules: {
    'curly': ['error', 'multi-line'],
    'vue/block-order': [
      'error',
      {
        order: ['template', 'script', 'style'],
      },
    ],
    'style/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      },
    ],
    'yml/indent': ['error', 4, { indentBlockSequences: true, indicatorValueIndent: 2 }],
    'no-console': 'off',
    'antfu/no-top-level-await': 'off',
    'no-func-assign': 'off',
    'no-useless-constructor': 'off',
    'valid-typeof': 'off',
    'regexp/no-super-linear-backtracking': 'off',
    'eslint-comments/no-unlimited-disable': 'off',
    'regexp/no-unused-capturing-group': 'off',
    'style/no-tabs': 'off', // 兼容 go 代码风格
    'no-array-constructor': 'off',
    'prefer-regex-literals': 'off',
    'style/max-statements-per-line': 'off',
    'no-new-func': 'off',
    'style/brace-style': 'off',
  },
});
