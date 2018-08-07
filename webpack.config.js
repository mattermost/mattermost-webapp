// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const childProcess = require('child_process');
const path = require('path');
const url = require('url');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const NPM_TARGET = process.env.npm_lifecycle_event; //eslint-disable-line no-process-env

var DEV = false;
var FULLMAP = false;
var TEST = false;
if (NPM_TARGET === 'run' || NPM_TARGET === 'run-fullmap') {
    DEV = true;
    if (NPM_TARGET === 'run-fullmap') {
        FULLMAP = true;
    }
}

if (NPM_TARGET === 'test') {
    DEV = false;
    TEST = true;
}

if (NPM_TARGET === 'stats') {
    DEV = true;
    TEST = false;
    FULLMAP = true;
}

const STANDARD_EXCLUDE = [
    path.join(__dirname, 'node_modules'),
    path.join(__dirname, 'non_npm_dependencies'),
];

var MYSTATS = {

    // Add asset Information
    assets: false,

    // Sort assets by a field
    assetsSort: '',

    // Add information about cached (not built) modules
    cached: true,

    // Show cached assets (setting this to `false` only shows emitted files)
    cachedAssets: true,

    // Add children information
    children: true,

    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks: true,

    // Add built modules information to chunk information
    chunkModules: true,

    // Add the origins of chunks and chunk merging info
    chunkOrigins: true,

    // Sort the chunks by a field
    chunksSort: '',

    // `webpack --colors` equivalent
    colors: true,

    // Display the distance from the entry point for each module
    depth: true,

    // Display the entry points with the corresponding bundles
    entrypoints: true,

    // Add errors
    errors: true,

    // Add details to errors (like resolving log)
    errorDetails: true,

    // Exclude modules which match one of the given strings or regular expressions
    exclude: [],

    // Add the hash of the compilation
    hash: true,

    // Set the maximum number of modules to be shown
    maxModules: 0,

    // Add built modules information
    modules: false,

    // Sort the modules by a field
    modulesSort: '!size',

    // Show performance hint when file size exceeds `performance.maxAssetSize`
    performance: true,

    // Show the exports of the modules
    providedExports: true,

    // Add public path information
    publicPath: true,

    // Add information about the reasons why modules are included
    reasons: true,

    // Add the source code of modules
    source: true,

    // Add timing information
    timings: true,

    // Show which exports of a module are used
    usedExports: true,

    // Add webpack version information
    version: true,

    // Add warnings
    warnings: true,

    // Filter warnings to be shown (since webpack 2.4.0),
    // can be a String, Regexp, a function getting the warning and returning a boolean
    // or an Array of a combination of the above. First match wins.
    warningsFilter: '',
};

let publicPath = '/static/';

// Allow overriding the publicPath in dev from the exported SiteURL.
if (DEV) {
    const siteURL = process.env.MM_SERVICESETTINGS_SITEURL || ''; //eslint-disable-line no-process-env
    if (siteURL) {
        publicPath = path.join(new url.URL(siteURL).pathname, 'static') + '/';
    }
}

var config = {
    entry: ['babel-polyfill', 'whatwg-fetch', 'url-search-params-polyfill', './root.jsx', 'root.html'],
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath,
        filename: '[name].[hash].js',
        chunkFilename: '[name].[chunkhash].js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)?$/,
                exclude: STANDARD_EXCLUDE,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                'react',
                                ['es2015', {modules: false}],
                                'stage-0',
                            ],
                            plugins: ['transform-runtime'],
                            cacheDirectory: true,
                        },
                    },
                ],
            },
            {
                type: 'javascript/auto',
                test: /\.json$/,
                include: [
                    path.resolve(__dirname, 'i18n'),
                ],
                exclude: [/en\.json$/],
                use: [
                    {
                        loader: 'file-loader?name=i18n/[name].[hash].[ext]',
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: ['node_modules/compass-mixins/lib'],
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                    },
                ],
            },
            {
                test: /\.(png|eot|tiff|svg|woff2|woff|ttf|gif|mp3|jpg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'files/[hash].[ext]',
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {},
                    },
                ],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            attrs: 'link:href',
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        modules: [
            'node_modules',
            'non_npm_dependencies',
            path.resolve(__dirname),
        ],
        alias: {
            jquery: 'jquery/src/jquery',
            superagent: 'node_modules/superagent/lib/client',
        },
        extensions: ['.js', '.jsx'],
    },
    performance: {
        hints: 'warning',
    },
    target: 'web',
    plugins: [
        new webpack.ProvidePlugin({
            'window.jQuery': 'jquery',
            $: 'jquery',
            jQuery: 'jquery',
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: !DEV,
            debug: false,
        }),
        new webpack.DefinePlugin({
            COMMIT_HASH: JSON.stringify(childProcess.execSync('git rev-parse HEAD || echo dev').toString()),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contentHash].css',
            chunkFilename: '[name].[contentHash].css',
        }),
    ],
};

if (NPM_TARGET !== 'stats') {
    config.stats = MYSTATS;
}

// Development mode configuration
if (DEV) {
    config.mode = 'development';
    if (FULLMAP) {
        config.devtool = 'source-map';
    } else {
        config.devtool = 'cheap-module-eval-source-map';
    }
}

// Production mode configuration
if (!DEV) {
    config.mode = 'production';
    config.devtool = 'source-map';
    config.plugins.push(
        new webpack.optimize.OccurrenceOrderPlugin(true)
    );
}

const env = {};
if (DEV) {
    env.PUBLIC_PATH = JSON.stringify(publicPath);
} else {
    env.NODE_ENV = JSON.stringify('production');
}
config.plugins.push(new webpack.DefinePlugin({
    'process.env': env,
}));

// Test mode configuration
if (TEST) {
    config.entry = ['babel-polyfill', './root.jsx'];
    config.target = 'node';
    config.externals = [nodeExternals()];
} else {
    // For some reason these break mocha. So they go here.
    config.plugins.push(
        new HtmlWebpackPlugin({
            filename: 'root.html',
            inject: 'head',
            template: 'root.html',
        })
    );
    config.plugins.push(
        new CopyWebpackPlugin([
            {from: 'images/emoji', to: 'emoji'},
            {from: 'images/img_trans.gif', to: 'images'},
            {from: 'images/logo-email.png', to: 'images'},
            {from: 'images/circles.png', to: 'images'},
            {from: 'images/favicon', to: 'images/favicon'},
            {from: 'images/appIcons.png', to: 'images'},
            {from: 'images/warning.png', to: 'images'},
        ])
    );
}

// Generate manifest.json, honouring any configured publicPath. This also handles injecting
// <link rel="apple-touch-icon" ... /> and <meta name="apple-*" ... /> tags into root.html.
config.plugins.push(
    new WebpackPwaManifest({
        name: 'Mattermost',
        short_name: 'Mattermost',
        description: 'Mattermost is an open source, self-hosted Slack-alternative',
        background_color: '#ffffff',
        inject: true,
        ios: true,
        fingerprints: false,
        orientation: 'any',
        filename: 'manifest.json',
        icons: [{
            src: path.resolve('images/favicon/android-chrome-192x192.png'),
            type: 'image/png',
            sizes: '192x192',
        }, {
            src: path.resolve('images/favicon/apple-touch-icon-120x120.png'),
            type: 'image/png',
            sizes: '120x120',
            ios: true,
        }, {
            src: path.resolve('images/favicon/apple-touch-icon-144x144.png'),
            type: 'image/png',
            sizes: '144x144',
            ios: true,
        }, {
            src: path.resolve('images/favicon/apple-touch-icon-152x152.png'),
            type: 'image/png',
            sizes: '152x152',
            ios: true,
        }, {
            src: path.resolve('images/favicon/apple-touch-icon-57x57.png'),
            type: 'image/png',
            sizes: '57x57',
            ios: true,
        }, {
            src: path.resolve('images/favicon/apple-touch-icon-60x60.png'),
            type: 'image/png',
            sizes: '60x60',
            ios: true,
        }, {
            src: path.resolve('images/favicon/apple-touch-icon-72x72.png'),
            type: 'image/png',
            sizes: '72x72',
            ios: true,
        }, {
            src: path.resolve('images/favicon/apple-touch-icon-76x76.png'),
            type: 'image/png',
            sizes: '76x76',
            ios: true,
        }, {
            src: path.resolve('images/favicon/favicon-16x16.png'),
            type: 'image/png',
            sizes: '16x16',
        }, {
            src: path.resolve('images/favicon/favicon-32x32.png'),
            type: 'image/png',
            sizes: '32x32',
        }, {
            src: path.resolve('images/favicon/favicon-96x96.png'),
            type: 'image/png',
            sizes: '96x96',
        }],
    })
);

module.exports = config;
