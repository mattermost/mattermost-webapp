// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MuiButton, {ButtonProps as MuiButtonProps} from '@mui/material/Button';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

const variantMap: Record<ButtonVariant, Exclude<MuiButtonProps['variant'], undefined>> = {
    primary: 'contained',
    secondary: 'outlined',
    tertiary: 'text',
};

type Props = Omit<MuiButtonProps, 'sx' | 'variant' | 'color'> & {
    destructive?: boolean;
    disabled?: boolean;
    variant?: ButtonVariant;
}

export const Button = ({variant = 'primary', destructive, ...rest}: Props) => (
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
