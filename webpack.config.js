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
const LiveReloadPlugin = require('webpack-livereload-plugin');

const NPM_TARGET = process.env.npm_lifecycle_event; //eslint-disable-line no-process-env

const targetIsRun = NPM_TARGET === 'run';
const targetIsTest = NPM_TARGET === 'test';
const targetIsStats = NPM_TARGET === 'stats';
const targetIsDevServer = NPM_TARGET === 'dev-server';

const DEV = targetIsRun || targetIsStats || targetIsDevServer;

const STANDARD_EXCLUDE = [
    path.join(__dirname, 'node_modules'),
];

// react-hot-loader requires eval
const CSP_UNSAFE_EVAL_IF_DEV = targetIsDevServer ? ' \'unsafe-eval\'' : '';

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
    entry: ['./root.jsx', 'root.html'],
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath,
        filename: '[name].[hash].js',
        chunkFilename: '[name].[contenthash].js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)?$/,
                exclude: STANDARD_EXCLUDE,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,

                        // Babel configuration is in .babelrc because jest requires it to be there.
                    },
                },
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
                    DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: ['node_modules/compass-mixins/lib', 'sass'],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
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
                test: /\.apng$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'files/[hash].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            attributes: {
                                list: [
                                    {
                                        tag: 'link',
                                        attribute: 'href',
                                        type: 'src',
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname),
        ],
        alias: {
            jquery: 'jquery/src/jquery',
            superagent: 'node_modules/superagent/lib/client',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
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
        new webpack.DefinePlugin({
            COMMIT_HASH: JSON.stringify(childProcess.execSync('git rev-parse HEAD || echo dev').toString()),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contentHash].css',
            chunkFilename: '[name].[contentHash].css',
        }),
        new HtmlWebpackPlugin({
            filename: 'root.html',
            inject: 'head',
            template: 'root.html',
            meta: {
                csp: {
                    'http-equiv': 'Content-Security-Policy',
                    content: 'script-src \'self\' cdn.rudderlabs.com/ js.stripe.com/v3 ' + CSP_UNSAFE_EVAL_IF_DEV,
                },
            },
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: 'images/emoji', to: 'emoji'},
                {from: 'images/img_trans.gif', to: 'images'},
                {from: 'images/logo-email.png', to: 'images'},
                {from: 'images/circles.png', to: 'images'},
                {from: 'images/favicon', to: 'images/favicon'},
                {from: 'images/appIcons.png', to: 'images'},
                {from: 'images/warning.png', to: 'images'},
                {from: 'images/logo-email.png', to: 'images'},
                {from: 'images/browser-icons', to: 'images/browser-icons'},
                {from: 'images/cloud', to: 'images'},
            ],
        }),

        // Generate manifest.json, honouring any configured publicPath. This also handles injecting
        // <link rel="apple-touch-icon" ... /> and <meta name="apple-*" ... /> tags into root.html.
        new WebpackPwaManifest({
            name: 'Mattermost',
            short_name: 'Mattermost',
            start_url: '..',
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
        }),
    ],
};

if (!targetIsStats) {
    config.stats = MYSTATS;
}

// Development mode configuration
if (DEV) {
    config.mode = 'development';
    config.devtool = 'source-map';
}

// Production mode configuration
if (!DEV) {
    config.mode = 'production';
    config.devtool = 'source-map';
}

const env = {};
if (DEV) {
    env.PUBLIC_PATH = JSON.stringify(publicPath);
    env.RUDDER_KEY = JSON.stringify(process.env.RUDDER_KEY || ''); //eslint-disable-line no-process-env
    env.RUDDER_DATAPLANE_URL = JSON.stringify(process.env.RUDDER_DATAPLANE_URL || ''); //eslint-disable-line no-process-env
    if (process.env.MM_LIVE_RELOAD) { //eslint-disable-line no-process-env
        config.plugins.push(new LiveReloadPlugin());
    }
} else {
    env.NODE_ENV = JSON.stringify('production');
    env.RUDDER_KEY = JSON.stringify(process.env.RUDDER_KEY || ''); //eslint-disable-line no-process-env
    env.RUDDER_DATAPLANE_URL = JSON.stringify(process.env.RUDDER_DATAPLANE_URL || ''); //eslint-disable-line no-process-env
}

config.plugins.push(new webpack.DefinePlugin({
    'process.env': env,
}));

// Test mode configuration
if (targetIsTest) {
    config.entry = ['./root.jsx'];
    config.target = 'node';
    config.externals = [nodeExternals()];
}

if (targetIsDevServer) {
    config = {
        ...config,
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            hot: true,
            injectHot: true,
            liveReload: false,
            overlay: true,
            proxy: [{
                context: () => true,
                bypass(req) {
                    if (req.url.indexOf('/api') === 0 ||
                        req.url.indexOf('/plugins') === 0 ||
                        req.url.indexOf('/static/plugins/') === 0 ||
                        req.url.indexOf('/sockjs-node/') !== -1) {
                        return null; // send through proxy to the server
                    }
                    if (req.url.indexOf('/static/') === 0) {
                        return path; // return the webpacked asset
                    }

                    // redirect (root, team routes, etc)
                    return '/static/root.html';
                },
                logLevel: 'silent',
                target: 'http://localhost:8065',
                xfwd: true,
                ws: true,
            }],
            port: 9005,
            watchContentBase: true,
            writeToDisk: false,
        },
        performance: false,
        optimization: {
            ...config.optimization,
            splitChunks: false,
        },
        resolve: {
            ...config.resolve,
            alias: {
                ...config.resolve.alias,
                'react-dom': '@hot-loader/react-dom',
            },
        },
    };
}

// Export PRODUCTION_PERF_DEBUG=1 when running webpack to enable support for the react profiler
// even while generating production code. (Performance testing development code is typically
// not helpful.)
// See https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html and
// https://gist.github.com/bvaughn/25e6233aeb1b4f0cdb8d8366e54a3977
if (process.env.PRODUCTION_PERF_DEBUG) { //eslint-disable-line no-process-env
    console.log('Enabling production performance debug settings'); //eslint-disable-line no-console
    config.resolve.alias['react-dom'] = 'react-dom/profiling';
    config.resolve.alias['schedule/tracing'] = 'schedule/tracing-profiling';
    config.optimization = {

        // Skip minification to make the profiled data more useful.
        minimize: false,
    };
}

module.exports = config;
