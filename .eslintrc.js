module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'prettier',
  ],
  plugins: [],
  reportUnusedDisableDirectives: true,
  // add your custom rules here
  overrides: [
    {
      files: ['components/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
    {
      files: ['components/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'error',
      },
    },
  ],
  rules: {},
}
