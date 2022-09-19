module.exports = {
  defaultNamespace: 'common',
  output: 'src/locales/$NAMESPACE_$LOCALE.json',
  locales: ['de', 'en'],
  input: [
    'src/**/*.{js,jsx,ts,tsx}'
  ]
};
