import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },
  {
    rules: {
      'react-hooks/incompatible-library': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default eslintConfig;
