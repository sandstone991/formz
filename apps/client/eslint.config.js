// @ts-check
import antfu from '@antfu/eslint-config';
import nuxt from './.nuxt/eslint.config.mjs';

export default nuxt(
  antfu(
    {
      unocss: true,
      formatters: true,
    },
  ).overrideRules({
    'ts/consistent-type-definitions': 'off',
    'style/semi': ['error'],
    'eslint-comments/no-unlimited-disable': 'off',
  }),
);
