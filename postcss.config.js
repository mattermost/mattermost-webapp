// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable global-require */

const postcssPresetEnv = require('postcss-preset-env');
module.exports = () => ({
    plugins: [
        postcssPresetEnv({
            stage: 2,
        }),
        require('autoprefixer'),
    ],
});
