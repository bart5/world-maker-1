module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'semi': [0, 'never'],
    'class-methods-use-this': 0,
    'comma-dangle': 0,
    'max-len': 0,
    'no-explicit-any': 0,
    'quote-props': 0,
    'member-delimiter-style': 0,
    'arrow-body-style': 0,
    'arrow-parens': 0,
    "@typescript-eslint/member-delimiter-style": 0,
    "@typescript-eslint/no-use-before-define": 0,
  },
};
