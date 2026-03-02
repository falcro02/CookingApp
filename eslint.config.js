import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
    { globals: globals.browser },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    { ignores: ['**/node_modules/**', '**/dist/**'] },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'error'
        }
    }
];

