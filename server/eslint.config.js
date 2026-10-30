import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // 1. Ignore patterns (replaces ignorePatterns)
  {
    ignores: ['dist', 'node_modules', 'build', '*.js', '*.cjs', 'coverage', '**/generated/**'],
  },

  // 2. Base ESLint recommended rules
  js.configs.recommended,

  // 3. TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

  // 4. Main configuration block
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply TS rules only to TS files
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },

  // 5. eslint-config-prettier (must be last to turn off conflicting ESLint rules)
  prettierConfig,
];
