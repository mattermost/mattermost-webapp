// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {styled} from '@mui/material/styles';
import MUIMenuItem, {MenuItemProps as MUIMenuItemProps} from '@mui/material/MenuItem';

type MenuItemProps = MUIMenuItemProps & {
    destructive?: boolean;
}

const StyledMenuItem = styled(MUIMenuItem)<MenuItemProps>(({destructive}) => ({
    backgroundColor: 'transparent',
    color: destructive ? 'var(--error-text)' : 'var(--center-channel-text)',

    '&:hover': destructive ? {
        backgroundColor: 'var(--error-text)',
        color: 'rgb(255, 255, 255)',
    } : {
        backgroundColor: 'rgba(var(--center-channel-text-rgb), 0.08)',
    },

    '&:active': destructive ? {
        backgroundColor: 'rgba(210, 75, 78, 1)',
        color: 'rgb(255, 255, 255)',
    } : {
        backgroundColor: 'rgba(var(--button bg-rgb), 0.08)',
    },

    '&.Mui-focused': destructive ? {
        backgroundColor: 'var(--error-text)',
        boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.16)',
        color: 'rgb(255, 255, 255)',
    } : {
        boxShadow: 'inset 0 0 0 2px var(--sidebar-active-border)',
    },

    '&.Mui-focused:not(.Mui-focusVisible)': destructive ? {
        backgroundColor: 'var(--error-text)',
        boxShadow: 'none',
        color: 'rgb(255, 255, 255)',
    } : {
        boxShadow: 'none',
    },

    '&.Mui-focused.Mui-focusVisible': destructive ? {
        backgroundColor: 'var(--error-text)',
        boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.16)',
        color: 'rgb(255, 255, 255)',
    } : {
        boxShadow: 'inset 0 0 0 2px var(--sidebar-active-border)',
    },

    svg: {
        opacity: destructive ? 1 : 0.56,
    },
}));

export default StyledMenuItem;
