// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', '@nx'],
  rules: {
    indent: ['off', 2, { SwitchCase: 1 }],
    'linebreak-style': ['off', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    '@typescript-eslint/no-namespace': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-empty-function': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@nx/enforce-module-boundaries': [
      'error',
      {
        allow: [],
        // update depConstraints based on your tags
        depConstraints: [
          {
            sourceTag: 'scope:lib',
            onlyDependOnLibsWithTags: ['scope:lib'],
          },
          {
            sourceTag: 'scope:app',
            onlyDependOnLibsWithTags: ['scope:lib'],
          },
        ],
      },
    ],
    'import/order': [
      1,
      {
        alphabetize: { order: 'asc' },
        'newlines-between': 'always',
        groups: [['builtin', 'external'], ['internal']],
      },
    ],
  },
};
