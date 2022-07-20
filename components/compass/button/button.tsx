// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {styled} from '@mui/material/styles';
import MUIButtonBase, {ButtonBaseProps as MUIButtonBaseProps} from '@mui/material/ButtonBase';

type ButtonProps = MUIButtonBaseProps & {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'icon';
}

const StyledButton = styled(MUIButtonBase)<ButtonProps>(({variant = 'primary'}) => {
    const isIcon = variant === 'icon';

    return ({
        display: 'flex',
        placeItems: 'center',
        placeContent: 'center',
        padding: isIcon ? 8 : '10px 16px',

        color: isIcon ? 'rgba(var(--center-channel-text-rgb), 0.56)' : 'var(--button-bg)',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 4,
        boxShadow: isIcon ? 'none' : 'inset 0 0 0 1px var(--button-bg)',

        fontSize: 12,
        fontWeight: 600,
        lineHeight: '10px',

        '&:hover': {
            backgroundColor: isIcon ? 'rgba(var(--center-channel-color-rgb), 0.08)' : 'rgba(var(--button-bg-rgb), 0.08)',
        },

        '&:active': {
            backgroundColor: isIcon ? 'rgba(var(--center-channel-color-rgb), 0.16)' : 'rgba(var(--button-bg-rgb), 0.16)',
        },

        '&:focus': {
            boxShadow: 'inset 0 0 0 2px var(--sidebar-text-active-border)',
        },

        '&:focus:not(:focus-visible)': {
            boxShadow: isIcon ? 'none' : 'inset 0 0 0 1px var(--button-bg)',
        },

        '&:focus:focus-visible': {
            boxShadow: 'inset 0 0 0 2px var(--sidebar-text-active-border)',
        },
    });
});

export default StyledButton;
