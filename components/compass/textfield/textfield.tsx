// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {styled} from '@mui/material/styles';
import React from 'react';
import {InputAdornment} from '@mui/material';
import MUITextField, {TextFieldProps as MUITextFieldProps} from '@mui/material/TextField';

const StyledTextField = styled(MUITextField)<MUITextFieldProps>(() => ({
    legend: {
        width: 0,
    },
}));

type TextFieldProps = Omit<MUITextFieldProps, 'InputProps'> & {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

const TextField = ({startIcon, endIcon, ...props}: TextFieldProps) => {
    const InputProps: MUITextFieldProps['InputProps'] = {notched: false};

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

    return (
        <StyledTextField
            {...props}
            InputProps={InputProps}
        />
    );
};

export default TextField;
