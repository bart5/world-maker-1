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
    // 'no-trailing-spaces': 0,
    'comma-dangle': 0,
    'max-len': 0,
    'no-explicit-any': 0,
    'quote-props': 0,
    'member-delimiter-style': 0,
    "@typescript-eslint/member-delimiter-style": 0,
    // "@typescript-eslint/member-delimiter-style": ["error", {
    //   multiline: {
    //     delimiter: 'none',    // 'none' or 'semi' or 'comma'
    //     requireLast: true,
    //   },
    //   singleline: {
    //     delimiter: 'semi',    // 'semi' or 'comma'
    //     requireLast: false,
    //   },
    // }]
  },
};
