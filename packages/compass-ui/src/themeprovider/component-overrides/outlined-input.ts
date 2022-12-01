// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {alpha, Theme} from '@mui/material';
import type {ComponentsOverrides} from '@mui/material/styles/overrides';

const componentName = 'MuiOutlinedInput';

const outlinedInputStyleOverrides: ComponentsOverrides<Theme>[typeof componentName] = {
    root: ({ownerState, theme}) => ({
        '.MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.text.primary, 0.16),
            ...(ownerState.size === 'small' && {
                paddingLeft: '7px',
            }),
            ...(ownerState.size === 'medium' && {
                paddingLeft: '9px',
            }),
            ...(ownerState.size === 'large' && {
                paddingLeft: '11px',
            }),
            '> legend': {
                fontSize: '0.8rem',
            },
        },

        '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.text.primary, 0.48),
        },

        '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),

            '.MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
            },
        },
    }),
    input: ({ownerState}) => ({
        ...(ownerState.size === 'small' && {
            padding: '0.8rem 1.2rem',
            height: '1.6rem',
        }),
        ...(ownerState.size === 'medium' && {
            padding: '1rem 1.5rem',
            height: '2rem',
        }),
        ...(ownerState.size === 'large' && {
            padding: '1.2rem 1.6rem',
            height: '2.4rem',
        }),
    }),
    focused: ({theme}) => ({
        '.MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.text.primary, 0.16),
        },
    }),
};

const overrides = {
    styleOverrides: outlinedInputStyleOverrides,
};

export default overrides;
