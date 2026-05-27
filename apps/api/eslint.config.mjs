import { dirname } from 'path';
import { fileURLToPath } from 'url';

import config from '@mid/eslint-config/node';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
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
