const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const vue = require('eslint-plugin-vue')
const prettier = require('eslint-config-prettier')
const reactHooks = require('eslint-plugin-react-hooks')
const reactRefresh = require('eslint-plugin-react-refresh')
const globals = require('globals')
const eslintPluginPrettier = require('eslint-plugin-prettier')

const tsParserOptions = {
  parser: tseslint.parser,
  globals: globals.browser,
  ecmaVersion: 'latest',
  sourceType: 'module',
}

const baseConfig = {
  plugins: {
    prettier: eslintPluginPrettier,
  },
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
  ],
  rules: {
    'prettier/prettier': 'error'
  },
}

module.exports = tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '**/dist/**', '**/node_modules/**', '**/build/**', '**/tests/**', '**/*.test.ts'] },

  // Core
  {
    ...baseConfig,
    files: ['packages/bpgraph-core/**/*.ts'],
    languageOptions: { parserOptions: tsParserOptions },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },

  // React
  {
    ...baseConfig,
    files: ['packages/bpgraph-react/**/*.{ts,tsx}'],
    languageOptions: { 
      parserOptions: { ...tsParserOptions, extraFileExtensions: ['.tsx'] },
    },
    extends: [
      ...baseConfig.extends,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.recommended,
    ],
  }
)
