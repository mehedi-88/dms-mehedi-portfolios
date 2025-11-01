module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'bn', 'ms'],
  },
  // Ensure we are using the correct path for translations
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : 'locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

