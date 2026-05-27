import { dirname } from 'path';
import { fileURLToPath } from 'url';

import config from '@mid/eslint-config/node';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: ['dist', 'node_modules', 'coverage'],
  },
  ...config,
  {
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
];
