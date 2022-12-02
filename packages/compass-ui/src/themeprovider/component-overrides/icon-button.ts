// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {alpha, Theme} from '@mui/material';
import type {ComponentsVariants} from '@mui/material';
import type {ComponentsOverrides} from '@mui/material/styles/overrides';

const componentName = 'MuiIconButton';

declare module '@mui/material/IconButton' {
    interface IconButtonPropsSizeOverrides {
        'x-small': true;
    }
}

const styleOverrides: ComponentsOverrides<Theme>[typeof componentName] = {
    root: ({theme}) => ({
        borderRadius: 4,

        '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.08),
        },

        '&:active': {
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },

        '&:focus': {
            boxShadow: `inset 0 0 0 2px ${theme.palette.secondary.main}`,
        },

        '&:focus:not(:focus-visible)': {
            boxShadow: 'none',
        },

        '&:focus:focus-visible': {
            boxShadow: `inset 0 0 0 2px ${theme.palette.secondary.main}`,
        },

        svg: {
            margin: 2,
            fill: 'currentColor',
        },
    }),
};

const variants: ComponentsVariants[typeof componentName] = [
    {
        props: {size: 'x-small'},
        style: {
            padding: 4,

            svg: {
                width: 14,
                height: 14,
            },
        },
    },
    {
        props: {size: 'small'},
        style: {
            padding: 6,

            svg: {
                width: 18,
                height: 18,
            },
        },
    },
    {
        props: {size: 'medium'},
        style: {
            padding: 8,

            svg: {
                width: 24,
                height: 24,
            },
        },
    },
    {
        props: {size: 'large'},
        style: {
            padding: 8,

            svg: {
                width: 32,
                height: 32,
            },
        },
    },
];

const overrides = {
    variants,
    styleOverrides,
};

export default overrides;
