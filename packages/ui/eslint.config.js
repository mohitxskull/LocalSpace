import { configPkg } from '@adonisjs/eslint-config'
import importPlugin from 'eslint-plugin-import'

export default configPkg({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
      warnOnUnsupportedTypeScriptVersion: false,
    },
  },
  files: ['**/*.ts', '**/*.tsx'],
  plugins: {
    import: importPlugin,
  },
  rules: {
    // https://github.com/import-js/eslint-plugin-import/blob/HEAD/docs/rules/extensions.md
    // 'import/extensions': ['error', 'always'],
  },
})
