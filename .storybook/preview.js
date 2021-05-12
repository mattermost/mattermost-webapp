// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import decorator from '../storybook/decorator';

import theme from './theme.js';

export const decorators = [
    decorator,
];

export const parameters = {
    options: {
        theme,
    },
};
