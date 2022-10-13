// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console, no-process-env */

const childProcess = require('child_process');
const http = require('http');
const path = require('path');

const url = require('url');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const {ModuleFederationPlugin} = require('webpack').container;
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const LiveReloadPlugin = require('webpack-livereload-plugin');

// const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const packageJson = require('./package.json');

const NPM_TARGET = process.env.npm_lifecycle_event;

const targetIsRun = NPM_TARGET?.startsWith('run');
const targetIsTest = NPM_TARGET === 'test';
const targetIsStats = NPM_TARGET === 'stats';
const targetIsDevServer = NPM_TARGET?.startsWith('dev-server');
const targetIsEslint = NPM_TARGET === 'check' || NPM_TARGET === 'fix' || process.env.VSCODE_CWD;

const DEV = targetIsRun || targetIsStats || targetIsDevServer;

const STANDARD_EXCLUDE = [
    path.join(__dirname, 'node_modules'),
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
    const siteURL = process.env.MM_SERVICESETTINGS_SITEURL || '';
    if (siteURL) {
        publicPath = path.join(new url.URL(siteURL).pathname, 'static') + '/';
    }
}

var config = {
    entry: ['./root.tsx', 'root.html'],
    output: {
        publicPath,
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].js',
        clean: true,
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
                        loader: 'file-loader?name=i18n/[name].[contenthash].[ext]',
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
                                includePaths: ['sass'],
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
                            name: 'files/[contenthash].[ext]',
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
                            name: 'files/[contenthash].[ext]',
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
                            sources: false,
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
            'mattermost-redux/test': 'packages/mattermost-redux/test',
            'mattermost-redux': 'packages/mattermost-redux/src',
            reselect: 'packages/reselect/src',
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
        },
    },
    performance: {
        hints: 'warning',
    },
    target: 'web',
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.DefinePlugin({
            COMMIT_HASH: JSON.stringify(childProcess.execSync('git rev-parse HEAD || echo dev').toString()),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[name].[contenthash].css',
        }),
        new HtmlWebpackPlugin({
            filename: 'root.html',
            inject: 'head',
            template: 'root.html',
            meta: {
                csp: {
                    'http-equiv': 'Content-Security-Policy',
                    content: generateCSP(),
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
                {from: 'images/welcome_illustration_new.png', to: 'images'},
                {from: 'images/logo_email_blue.png', to: 'images'},
                {from: 'images/logo_email_dark.png', to: 'images'},
                {from: 'images/logo_email_gray.png', to: 'images'},
                {from: 'images/forgot_password_illustration.png', to: 'images'},
                {from: 'images/invite_illustration.png', to: 'images'},
                {from: 'images/channel_icon.png', to: 'images'},
                {from: 'images/add_payment_method.png', to: 'images'},
                {from: 'images/add_subscription.png', to: 'images'},
                {from: 'images/c_avatar.png', to: 'images'},
                {from: 'images/c_download.png', to: 'images'},
                {from: 'images/c_socket.png', to: 'images'},
                {from: 'images/admin-onboarding-background.jpg', to: 'images'},
                {from: 'images/payment-method-illustration.png', to: 'images'},
                {from: 'images/cloud-laptop.png', to: 'images'},
                {from: 'images/cloud-laptop-error.png', to: 'images'},
                {from: 'images/cloud-laptop-warning.png', to: 'images'},
                {from: 'images/cloud-upgrade-person-hand-to-face.png', to: 'images'},
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

        // Disabling this plugin until we come up with better bundle analysis ci
        // new BundleAnalyzerPlugin({
        //     analyzerMode: 'disabled',
        //     generateStatsFile: true,
        //     statsFilename: 'bundlestats.json',
        // }),
    ],
};

function generateCSP() {
    let csp = 'script-src \'self\' cdn.rudderlabs.com/ js.stripe.com/v3';

    if (DEV) {
        // react-hot-loader and development source maps require eval
        csp += ' \'unsafe-eval\'';

        // Focalboard runs on http://localhost:9006
        csp += ' http://localhost:9006';
    }

    return csp;
}

async function initializeModuleFederation() {
    function makeSingletonSharedModules(packageNames) {
        const sharedObject = {};

        for (const packageName of packageNames) {
            const version = packageJson.dependencies[packageName];

            sharedObject[packageName] = {
                requiredVersion: version,
                singleton: true,
                strictVersion: true,
                version,
            };
        }

        return sharedObject;
    }

    function isWebpackDevServerAvailable(baseUrl) {
        return new Promise((resolve) => {
            if (!DEV) {
                resolve(false);
                return;
            }

            const req = http.request(`${baseUrl}/remote_entry.js`, (response) => {
                return resolve(response.statusCode === 200);
            });

            req.on('error', () => {
                resolve(false);
            });

            req.end();
        });
    }

    async function getRemoteModules() {
        const products = [
            {name: 'focalboard', baseUrl: 'http://localhost:9006'},
        ];

        const productsFound = await Promise.all(products.map((product) => isWebpackDevServerAvailable(product.baseUrl)));

        const remotes = {};
        const aliases = {};

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const found = productsFound[i];

            if (found) {
                console.log(`Product ${product.name} found, adding as remote module`);

                remotes[product.name] = `${product.name}@${product.baseUrl}/remote_entry.js`;
            } else {
                console.log(`Product ${product.name} not found`);

                // Add false aliases to prevent Webpack from trying to resolve the missing modules
                aliases[product.name] = false;
                aliases[`${product.name}/manifest`] = false;
            }
        }

        return {remotes, aliases};
    }

    const {remotes, aliases} = await getRemoteModules();

    config.plugins.push(new ModuleFederationPlugin({
        name: 'mattermost-webapp',
        remotes,
        shared: [

            // Shared modules will be made available to other containers (ie products and plugins using module federation).
            // To allow for better sharing, containers shouldn't require exact versions of packages like the web app does.

            // Other containers will use these shared modules if their required versions match. If they don't match, the
            // version packaged with the container will be used.
            '@mattermost/client',
            '@mattermost/components',
            '@mattermost/types',
            'luxon',
            'prop-types',

            // Other containers will be forced to use the exact versions of shared modules that the web app provides.
            makeSingletonSharedModules([
                'react',
                'react-bootstrap',
                'react-dom',
                'react-intl',
                'react-redux',
                'react-router-dom',
            ]),
        ],
    }));

    config.resolve.alias = {
        ...config.resolve.alias,
        ...aliases,
    };

    config.plugins.push(new webpack.DefinePlugin({
        REMOTE_MODULES: JSON.stringify(remotes),
    }));
}

if (!targetIsStats) {
    config.stats = MYSTATS;
}

if (DEV) {
    // Development mode configuration
    config.mode = 'development';
    config.devtool = 'eval-cheap-module-source-map';
} else {
    // Production mode configuration
    config.mode = 'production';
    config.devtool = 'source-map';
}

const env = {};
if (DEV) {
    env.PUBLIC_PATH = JSON.stringify(publicPath);
    env.RUDDER_KEY = JSON.stringify(process.env.RUDDER_KEY || '');
    env.RUDDER_DATAPLANE_URL = JSON.stringify(process.env.RUDDER_DATAPLANE_URL || '');
    if (process.env.MM_LIVE_RELOAD) {
        config.plugins.push(new LiveReloadPlugin());
    }
} else {
    env.NODE_ENV = JSON.stringify('production');
    env.RUDDER_KEY = JSON.stringify(process.env.RUDDER_KEY || '');
    env.RUDDER_DATAPLANE_URL = JSON.stringify(process.env.RUDDER_DATAPLANE_URL || '');
}

config.plugins.push(new webpack.DefinePlugin({
    'process.env': env,
}));

// Test mode configuration
if (targetIsTest) {
    config.entry = ['./root.tsx'];
    config.target = 'node';
    config.externals = [nodeExternals()];
}

if (targetIsDevServer) {
    config = {
        ...config,
        devtool: 'eval-cheap-module-source-map',
        devServer: {
            liveReload: true,
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
            devMiddleware: {
                writeToDisk: false,
            },
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
if (process.env.PRODUCTION_PERF_DEBUG) {
    console.log('Enabling production performance debug settings'); //eslint-disable-line no-console
    config.resolve.alias['react-dom'] = 'react-dom/profiling';
    config.resolve.alias['schedule/tracing'] = 'schedule/tracing-profiling';
    config.optimization = {

        // Skip minification to make the profiled data more useful.
        minimize: false,
    };
}

if (targetIsEslint) {
    // ESLint can't handle setting an async config, so just skip the async part
    module.exports = config;
} else {
    module.exports = async () => {
        // Do this asynchronously so we can determine whether which remote modules are available
        await initializeModuleFederation();

        return config;
    };
}
