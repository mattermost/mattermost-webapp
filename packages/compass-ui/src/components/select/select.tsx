// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MUISelect, {SelectProps as MUISelectProps} from '@mui/material/Select';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';

type SelectProps<T> = Omit<MUISelectProps<T>, 'IconComponent' | 'MenuProps' | 'variant'>

function Select<T>(props: SelectProps<T>) {
    const MenuProps: MUISelectProps<T>['MenuProps'] = {
        anchorOrigin: {
            horizontal: 'left',
            vertical: 'bottom',
        },
        transformOrigin: {
            vertical: -4,
            horizontal: 'left',
        },
    };

    return (
        <MUISelect
            {...props}
            variant='standard'
            MenuProps={MenuProps}
            IconComponent={ChevronDownIcon}
        />
    );
}

export default Select;
