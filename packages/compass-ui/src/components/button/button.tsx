// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {alpha, darken, lighten, styled} from '@mui/material';
import React from 'react';
import MuiButton, {ButtonProps as MuiButtonProps} from '@mui/material/Button';

type StyledProps = Required<Pick<MuiButtonProps, 'variant' | 'color'>> & Omit<MuiButtonProps, 'variant' | 'color'>;

const StyledButton = styled(MuiButton)<StyledProps>(({theme, color, variant}) => {
    const usedColor = color && color !== 'inherit' ? color : 'primary';
    return ({
        textTransform: 'none',

        '&:active': {
            backgroundColor: alpha(
                darken(theme.palette[usedColor].dark, theme.palette.tonalOffset as number),
                variant === 'contained' ? 1 : theme.palette.action.activatedOpacity,
            ),
        },

        '&:not(.Mui-disabled)': {
            '&:focus': {
                boxShadow: `inset 0 0 0 2px ${lighten(theme.palette[usedColor].light, 0.2)}`,
            },

            '&:focus:not(:focus-visible)': {
                boxShadow: 'none',
            },

            '&:focus:focus-visible': {
                boxShadow: `inset 0 0 0 2px ${lighten(theme.palette[usedColor].light, 0.2)}`,
            },
        },
    });
});

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

type Props = Omit<MuiButtonProps, 'sx' | 'variant' | 'color'> & {
    destructive?: boolean;
    disabled?: boolean;
    variant?: ButtonVariant;
}

const variantMap: Record<ButtonVariant, Exclude<MuiButtonProps['variant'], undefined>> = {
    primary: 'contained',
    secondary: 'outlined',
    tertiary: 'text',
};

const Button = ({variant = 'primary', destructive, ...rest}: Props) => (
    <StyledButton
        {...rest}
        disableElevation={true}
        disableRipple={true}
        disableFocusRipple={true}
        disableTouchRipple={true}
        color={destructive ? 'error' : 'primary'}
        variant={variantMap[variant]}
    />
);

export const WrappedMuiButton = ({variant = 'primary', destructive, ...rest}: Props) => (
    <MuiButton
        {...rest}
        disableElevation={true}
        disableRipple={true}
        disableFocusRipple={true}
        disableTouchRipple={true}
        color={destructive ? 'error' : 'primary'}
        variant={variantMap[variant]}
    />
);

export default Button;
