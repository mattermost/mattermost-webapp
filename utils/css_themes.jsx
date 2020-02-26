// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import _githubCSS from '!!file-loader?name=files/code_themes/[hash].[ext]!highlight.js/styles/github.css';

// eslint-disable-line import/order
import _monokaiCSS from '!!file-loader?name=files/code_themes/[hash].[ext]!highlight.js/styles/monokai.css';

// eslint-disable-line import/order
import _solarizedDarkCSS from '!!file-loader?name=files/code_themes/[hash].[ext]!highlight.js/styles/solarized-dark.css';

// eslint-disable-line import/order
import _solarizedLightCSS from '!!file-loader?name=files/code_themes/[hash].[ext]!highlight.js/styles/solarized-light.css'; // eslint-disable-line import/order

export const githubCSS = _githubCSS;
export const monokaiCSS = _monokaiCSS;
export const solarizedDarkCSS = _solarizedDarkCSS;
export const solarizedLightCSS = _solarizedLightCSS;