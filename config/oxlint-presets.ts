import type { UserConfig } from '@voidzero-dev/vite-plus-core';

type OxlintPreset = Pick<NonNullable<UserConfig['lint']>, 'plugins' | 'rules'>;

export const strictCodeQualityPreset = {
  plugins: ['typescript', 'import', 'promise', 'unicorn'],
  rules: {
    'eslint/no-async-promise-executor': 'error',
    'eslint/no-duplicate-imports': ['error', { includeExports: true }],
    'eslint/no-implicit-coercion': 'error',
    'eslint/no-param-reassign': 'error',
    'eslint/no-promise-executor-return': ['error', { allowVoid: true }],
    'eslint/no-useless-catch': 'error',
    'eslint/prefer-object-has-own': 'error',
    'eslint/prefer-promise-reject-errors': 'error',
    'import/default': 'error',
    'import/first': 'error',
    'import/named': 'error',
    'import/no-absolute-path': 'error',
    'import/no-commonjs': 'error',
    'import/no-cycle': 'error',
    'import/no-duplicates': ['error', { preferInline: true }],
    'import/no-self-import': 'error',
    'oxc/bad-char-at-comparison': 'error',
    'oxc/bad-object-literal-comparison': 'error',
    'oxc/const-comparisons': 'error',
    'oxc/missing-throw': 'error',
    'oxc/no-const-enum': 'error',
    'oxc/uninvoked-array-callback': 'error',
    'promise/no-new-statics': 'error',
    'promise/valid-params': 'error',
    'typescript/await-thenable': 'error',
    'typescript/consistent-type-exports': [
      'error',
      { fixMixedExportsWithInlineTypeSpecifier: true },
    ],
    'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    'typescript/no-deprecated': 'error',
    'typescript/no-floating-promises': 'error',
    'typescript/no-for-in-array': 'error',
    'typescript/no-non-null-asserted-optional-chain': 'error',
    'typescript/no-unnecessary-boolean-literal-compare': 'error',
    'typescript/no-unnecessary-condition': 'error',
    'typescript/no-unnecessary-type-assertion': 'error',
    'typescript/no-unsafe-declaration-merging': 'error',
    'typescript/prefer-as-const': 'error',
    'unicorn/error-message': 'error',
    'unicorn/no-empty-file': 'error',
    'unicorn/no-invalid-fetch-options': 'error',
    'unicorn/no-single-promise-in-promise-methods': 'error',
    'unicorn/no-unnecessary-await': 'error',
    'unicorn/no-useless-collection-argument': 'error',
    'unicorn/no-useless-length-check': 'error',
    'unicorn/no-useless-spread': 'error',
    'unicorn/no-useless-undefined': 'error',
  },
} satisfies OxlintPreset;

export const mobileReactPreset = {
  plugins: ['typescript', 'import', 'promise', 'react', 'unicorn'],
  rules: {
    'react/jsx-boolean-value': ['error', 'never', { assumeUndefinedIsFalse: true }],
    'react/jsx-curly-brace-presence': 'error',
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/no-children-prop': 'error',
    'react/no-unknown-property': 'error',
    'react/rules-of-hooks': 'error',
    'react/self-closing-comp': 'error',
    'react/void-dom-elements-no-children': 'error',
  },
} satisfies OxlintPreset;

export const serverNodePreset = {
  plugins: ['typescript', 'import', 'node', 'promise', 'unicorn'],
  rules: {
    'no-console': 'off',
    'node/no-path-concat': 'error',
  },
} satisfies OxlintPreset;

export const serverTestPreset = {
  plugins: ['typescript', 'import', 'promise', 'unicorn', 'vitest'],
  rules: {
    'vitest/require-mock-type-parameters': 'error',
  },
} satisfies OxlintPreset;
