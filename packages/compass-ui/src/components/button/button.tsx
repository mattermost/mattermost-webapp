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

type IncludedMuiProps = 'size' | 'disabled';

type Props = Pick<MuiButtonProps, IncludedMuiProps> & {
    destructive?: boolean;
    disabled?: boolean;
    inverted?: boolean;
    variant?: ButtonVariant;
    children: React.ReactNode | React.ReactNode[];
}

export const Button = ({variant = 'primary', destructive, ...rest}: Props) => (
    <MuiButton
        {...rest}
        color={destructive ? 'error' : 'primary'}
        variant={variantMap[variant]}
    />
);

export default Button;
