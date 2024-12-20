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
    'no-unused-vars': 'off',
    'array-callback-return': 'off',
    'ts/no-unsafe-function-type': 'off',
    'prefer-promise-reject-errors': 'off',
    'unused-imports/no-unused-vars': 'off',
    'node/prefer-global/process': 'off',
    'ts/no-this-alias': 'off',
    'jsdoc/check-param-names': 'off',
    'no-prototype-builtins': 'off',
    'style/no-mixed-operators': 'off',
    'unicorn/no-new-array': 'off',
    'unicorn/prefer-dom-node-text-content': 'off',
    'ts/no-require-imports': 'off',
    'ts/ban-ts-comment': 'off',
    'ts/no-use-before-define': 'off',
    'no-extend-native': 'off',
    'eqeqeq': 'warn',
    'ts/method-signature-style': 'off',
    'prefer-spread': 'off',
    'react/no-useless-fragment': 'off',
    'react-dom/no-children-in-void-dom-elements': 'off',
    'react/prefer-destructuring-assignment': 'off',
    'react-refresh/only-export-components)': 'off',
    'react-dom/no-missing-button-type': 'off',
    'react-refresh/only-export-components': 'off',
    'react/no-array-index-key': 'off',
    'no-empty': 'warn',
    'unicorn/prefer-number-properties': 'off',
    'ts/no-namespace': 'off',
    'style/multiline-ternary': 'off',
    'ts/no-unused-expressions': 'off',
    '@next/next/no-img-element': 'off',
    'no-self-assign': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'prefer-const': 'warn',
    'import/no-duplicates': 'off',
    'unicorn/error-message': 'off',
    'style/operator-linebreak': 'off',
  },
});
