// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import resolve from '@rollup/plugin-node-resolve'; //eslint-disable-line
import commonjs from '@rollup/plugin-commonjs';
import scss from 'rollup-plugin-scss';

import ts from 'rollup-plugin-ts';

import packagejson from './package.json';

const externals = [
    ...Object.keys(packagejson.dependencies || {}),
    ...Object.keys(packagejson.peerDependencies || {}),
    'mattermost-redux',
    'reselect',
];

export default [
    {
        input: 'src/index.tsx',
        output: [
            {
                sourcemap: true,
                file: packagejson.module,
                format: 'es',
                globals: {'styled-components': 'styled'},
            },
        ],
        plugins: [
            scss(),
            resolve({
                browser: true,
                extensions: ['.ts', '.tsx'],
            }),
            commonjs(),
            ts({
                transpiler: 'babel',
                browserslist: false,
            }),
        ],
        external: (pkg) => externals.some((external) => pkg.startsWith(external)),
        watch: {
            clearScreen: false,
        },
    },
];
