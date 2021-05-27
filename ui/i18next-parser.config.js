module.exports = {
    defaultNamespace: 'common',
    output: 'src/locales/$LOCALE/$NAMESPACE.json',
    locales: ['de', 'en'],
    input: [
        'src/**/*.{js,jsx,ts,tsx}'
    ]
}
