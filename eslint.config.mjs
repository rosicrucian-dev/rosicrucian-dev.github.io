import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Unused imports, variables and parameters are flagged, so code that
    // has stopped being used is noticed and removed. A name starting with
    // an underscore is deliberately unused.
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // The Tailwind Plus source kit — reference only, not linted.
    'oatmeal-olive-instrument/**',
    // Vendored third-party code (Google's Draco decoder), served as is.
    'public/draco/**',
  ]),
])

export default eslintConfig
