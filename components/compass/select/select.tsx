// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MUISelect, {SelectProps, SelectProps as MUISelectProps} from '@mui/material/Select';

function Select <T>(props: MUISelectProps<T>) {
    const MenuProps: SelectProps['MenuProps'] = {
        anchorOrigin: {
            horizontal: 'left',
            vertical: 'bottom',
        },
        transformOrigin: {
            vertical: -4,
            horizontal: 'left',
        },
        MenuListProps: {
            sx: {
                minWidth: '200px',
            },
        },
    };

    return (
        <MUISelect
            {...props}
            MenuProps={MenuProps}
        />
    );
}

export default Select;
