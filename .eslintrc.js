module.exports = {
  env: {
    browser: true,
    'jest/globals': true,
  },
  extends: ['eslint:recommended'],
  globals: {
    module: true,
    Phaser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'jest'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
  },
};
