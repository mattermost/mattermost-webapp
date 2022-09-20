// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {InputAdornment} from '@mui/material';
import MUITextField, {TextFieldProps as MUITextFieldProps} from '@mui/material/TextField';

type TextFieldProps = Omit<MUITextFieldProps, 'InputProps'> & {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

const TextField = ({startIcon, endIcon, value, onFocus, onBlur, ...props}: TextFieldProps) => {
    const [shrink, setShrink] = React.useState(Boolean(value));

    const InputProps: MUITextFieldProps['InputProps'] = {};

    if (startIcon) {
        InputProps.startAdornment = (
            <InputAdornment position='start'>
                {startIcon}
            </InputAdornment>
        );
    }

    if (endIcon) {
        InputProps.endAdornment = (
            <InputAdornment position='end'>
                {endIcon}
            </InputAdornment>
        );
    }

    const makeFocusHandler = (focus: boolean) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (focus) {
            setShrink(true);
            onFocus?.(e);
            return;
        }

        setShrink(Boolean(value));
        onBlur?.(e);
    };

    const InputLabelProps: MUITextFieldProps['InputLabelProps'] = {
        shrink,
        sx: {
            '&.MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                transform: startIcon ? 'translate(40px, 0.8rem)' : 'translate(24px, 0.8rem)',
            },
        },
    };

    return (
        <MUITextField
            {...props}
            onFocus={makeFocusHandler(true)}
            onBlur={makeFocusHandler(false)}
            InputProps={InputProps}
            InputLabelProps={InputLabelProps}
        />
    );
};

export default TextField;
