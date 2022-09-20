// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsOverrides} from '@mui/material/styles/overrides';
import {DefaultTheme} from '@mui/private-theming';

const componentName = 'MuiMenuItem';

export const menuItemStyleOverrides: ComponentsOverrides<DefaultTheme>[typeof componentName] = {
    root: ({ownerState}) => ({
        backgroundColor: 'transparent',
        color: ownerState.destructive ? 'var(--error-text)' : 'var(--center-channel-text)',
        minWidth: 'unset',

        '&:hover': ownerState.destructive ? {
            backgroundColor: 'var(--error-text)',
            color: 'rgb(255, 255, 255)',
        } : {
            backgroundColor: 'rgba(var(--center-channel-text-rgb), 0.08)',
        },

        '&:active': ownerState.destructive ? {
            backgroundColor: 'rgba(210, 75, 78, 1)',
            color: 'rgb(255, 255, 255)',
        } : {
            backgroundColor: 'rgba(var(--button bg-rgb), 0.08)',
        },

        '&.Mui-focused': ownerState.destructive ? {
            backgroundColor: 'var(--error-text)',
            boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.16)',
            color: 'rgb(255, 255, 255)',
        } : {
            boxShadow: 'inset 0 0 0 2px var(--sidebar-active-border)',
        },

        '&.Mui-focused:not(.Mui-focusVisible)': ownerState.destructive ? {
            backgroundColor: 'var(--error-text)',
            boxShadow: 'none',
            color: 'rgb(255, 255, 255)',
        } : {
            boxShadow: 'none',
        },

        '&.Mui-focused.Mui-focusVisible': ownerState.destructive ? {
            backgroundColor: 'var(--error-text)',
            boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.16)',
            color: 'rgb(255, 255, 255)',
        } : {
            boxShadow: 'inset 0 0 0 2px var(--sidebar-active-border)',
        },

        svg: {
            opacity: ownerState.destructive ? 1 : 0.56,
        },
    }),
};

export default {
    styleOverrides: menuItemStyleOverrides,
};
