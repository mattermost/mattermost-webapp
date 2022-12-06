// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {alpha, ComponentsProps, ComponentsVariants, emphasize, Theme} from '@mui/material';
import {ComponentsOverrides} from '@mui/material/styles/overrides';

const componentName = 'MuiButton';

declare module '@mui/material/Button' {
    interface ButtonPropsSizeOverrides {
        'x-small': true;
    }

    interface ButtonPropsVariantOverrides {
        quaternary: true;
    }
}

const defaultProps: ComponentsProps[typeof componentName] = {
    disableElevation: true,
};

const getFocusStyles = (color: string) => ({
    '&:not(.Mui-disabled)': {
        '&:focus': {
            boxShadow: `inset 0 0 0 2px ${emphasize(color, 0.3)}`,
        },

        '&:focus:not(:focus-visible)': {
            boxShadow: 'none',
        },

        '&:focus:focus-visible': {
            boxShadow: `inset 0 0 0 2px ${emphasize(color, 0.3)}`,
        },
    },
});

const styleOverrides: ComponentsOverrides<Theme>[typeof componentName] = {
    containedPrimary: ({theme}) => ({
        '&:hover': {
            backgroundColor: emphasize(theme.palette.primary.main, 0.2),
        },
        '&:active': {
            backgroundColor: emphasize(theme.palette.primary.main, 0.4),
        },

        '&.Mui-disabled': {
            color: alpha(theme.palette.text.primary, 0.32),
            backgroundColor: alpha(theme.palette.text.primary, 0.08),
        },

        ...getFocusStyles(theme.palette.primary.main),
    }),
    containedError: ({theme}) => ({
        '&:active': {
            backgroundColor: emphasize(theme.palette.error.dark, 0.2),
        },

        '&.Mui-disabled': {
            color: alpha(theme.palette.text.primary, 0.32),
            backgroundColor: alpha(theme.palette.text.primary, 0.08),
        },

        ...getFocusStyles(theme.palette.error.main),
    }),
    outlinedPrimary: ({theme}) => ({
        backgroundColor: alpha(theme.palette.primary.main, 0),

        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },

        '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
        },

        '&.Mui-disabled': {
            color: alpha(theme.palette.text.primary, 0.32),
            borderColor: alpha(theme.palette.text.primary, 0.32),
            backgroundColor: alpha(theme.palette.text.primary, 0),
        },

        ...getFocusStyles(theme.palette.primary.main),
    }),
    outlinedError: ({theme}) => ({
        backgroundColor: alpha(theme.palette.error.main, 0),

        '&:hover': {
            backgroundColor: alpha(theme.palette.error.main, 0.08),
        },

        '&:active': {
            backgroundColor: alpha(theme.palette.error.main, 0.16),
        },

        '&.Mui-disabled': {
            color: alpha(theme.palette.text.primary, 0.32),
            borderColor: alpha(theme.palette.text.primary, 0.32),
            backgroundColor: alpha(theme.palette.text.primary, 0),
        },

        ...getFocusStyles(theme.palette.error.main),
    }),
    textPrimary: ({theme}) => ({
        backgroundColor: alpha(theme.palette.primary.main, 0.08),

        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },

        '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
        },

        '&.Mui-disabled': {
            color: alpha(theme.palette.text.primary, 0.32),
            backgroundColor: alpha(theme.palette.text.primary, 0.08),
        },

        ...getFocusStyles(theme.palette.primary.main),
    }),
    textError: ({theme}) => ({
        backgroundColor: alpha(theme.palette.error.main, 0.8),

        '&:hover': {
            backgroundColor: alpha(theme.palette.error.main, 0.12),
        },

        '&:active': {
            backgroundColor: alpha(theme.palette.error.main, 0.16),
        },

        '&.Mui-disabled': {
            color: alpha(theme.palette.text.primary, 0.32),
            backgroundColor: alpha(theme.palette.text.primary, 0.08),
        },

        ...getFocusStyles(theme.palette.error.main),
    }),
};

const variants: ComponentsVariants[typeof componentName] = [
    {
        props: {size: 'x-small'},
        style: ({theme}) => ({
            padding: '0.5rem 1rem 0.3rem',
            ...theme.typography.b50,
            margin: 0,
            textTransform: 'none',
        }),
    },
    {
        props: {size: 'small'},
        style: ({theme}) => ({
            padding: '0.9rem 1.6rem 0.7rem',
            ...theme.typography.b75,
            margin: 0,
            textTransform: 'none',
        }),
    },
    {
        props: {size: 'medium'},
        style: ({theme}) => ({
            padding: '1.1rem 2rem 0.9rem',
            ...theme.typography.b100,
            margin: 0,
            textTransform: 'none',
        }),
    },
    {
        props: {size: 'large'},
        style: ({theme}) => ({
            padding: '1.3rem 2.4rem 1.1rem',
            ...theme.typography.b200,
            margin: 0,
            textTransform: 'none',
        }),
    },
    {
        props: {variant: 'quaternary'},
        style: () => ({
            backgroundColor: 'red',
        }),
    },
];

const buttonOverrides = {
    variants,
    defaultProps,
    styleOverrides,
};

export default buttonOverrides;
