// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

const path = require('path');

const STANDARD_EXCLUDE = [
    path.join(__dirname, '..', 'node_modules'),
    path.join(__dirname, '..', 'non_npm_dependencies'),
    path.join(__dirname, '..', 'dist'),
];

module.exports = async ({config, mode}) => {
    config.module.rules[0].exclude = STANDARD_EXCLUDE;
    config.module.rules[0].test = /\.(js|jsx|ts|tsx)?$/;
    config.resolve.extensions.push('.ts', '.tsx');

    config.module.rules.push({
      test: /\.scss$/,
      use: [
          'style-loader',
          {
              loader: 'css-loader',
          },
          {
              loader: 'sass-loader',
              options: {
                  includePaths: ['node_modules/compass-mixins/lib', 'sass'],
              },
          },
      ],
    });

    config.resolve.alias.components = path.join(path.resolve(__dirname), '..', 'components')
    config.resolve.alias.actions = path.join(path.resolve(__dirname), '..', 'actions')
    config.resolve.alias.i18n = path.join(path.resolve(__dirname), '..', 'i18n')
    config.resolve.alias.utils = path.join(path.resolve(__dirname), '..', 'utils')
    config.resolve.alias.stores = path.join(path.resolve(__dirname), '..', 'stores')
    config.resolve.alias.actions = path.join(path.resolve(__dirname), '..', 'actions')
    config.resolve.alias.selectors = path.join(path.resolve(__dirname), '..', 'selectors')
    config.resolve.alias.images = path.join(path.resolve(__dirname), '..', 'images')
    config.resolve.alias.store = path.join(path.resolve(__dirname), '..', 'store')
    config.resolve.alias.reducers = path.join(path.resolve(__dirname), '..', 'reducers')
    config.resolve.alias.sass = path.join(path.resolve(__dirname), '..', 'sass')
    config.resolve.alias.storybook = path.join(path.resolve(__dirname), '..', 'storybook')

    return config;
};
