// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ComponentsOverrides} from '@mui/material/styles/overrides';
import type {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiOutlinedInput';

const outlinedInputStyleOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    root: {
        backgroundColor: 'var(--center-channel-bg)',
        fontSize: '1.6rem',
        padding: 0,

        '.MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(var(--center-channel-text-rgb), 0.16)',
        },

        '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(var(--center-channel-text-rgb), 0.48)',
        },

        '&:active': {
            backgroundColor: 'rgba(var(--button-bg-rgb), 0.04)',

            '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(var(--button-bg-rgb), 1)',
            },
        },

        '.Mui-focused': {
            '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--button-bg)',
            },
        },
    },
};

const overrides = {
    styleOverrides: outlinedInputStyleOverrides,
};

export default overrides;
