import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import neverthrowMustUse from "eslint-plugin-neverthrow-must-use";
// import tsParser from "@typescript-eslint/parser";


export default tseslint.config(
	{ ignores: ['dist'] },

	js.configs.recommended,
	tseslint.configs.recommended,
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			"neverthrow-must-use": neverthrowMustUse,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'@typescript-eslint/no-unused-vars': 'off',
			'no-unused-vars': 'off',
			"neverthrow-must-use/must-use-result": "error",
		},
	},
)

