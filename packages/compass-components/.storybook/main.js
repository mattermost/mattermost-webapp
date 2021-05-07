module.exports = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.(js|jsx|ts|tsx)'],
    addons: [
        '@etchteam/storybook-addon-status',
        '@storybook/addon-links',
        '@storybook/addon-docs',
        '@storybook/addon-essentials',
        '@storybook/addon-viewport',
        '@storybook/addon-a11y',
        '@storybook/addon-actions',
        'storybook-addon-themes',
    ],
    typescript: {
        check: false,
        checkOptions: {},
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractValuesFromUnion: true,
            shouldRemoveUndefinedFromOptional: true,
            shouldExtractLiteralValuesFromEnum: true,
            propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
        },
    },
};
