// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MUIListItemIcon, {ListItemIconProps as MUIListItemIconProps} from '@mui/material/ListItemIcon';

import {OmitMUIProps} from '../../types';

type ListItemIconProps = OmitMUIProps<MUIListItemIconProps> & {
    position?: 'start' | 'end';
}

const ListItemIcon = ({position = 'start', ...props}: ListItemIconProps) => {
    const sx = {
        padding: position === 'end' ? '0 0 0 18px' : '0 12px 0 0',
    };

    return (
        <MUIListItemIcon
            {...props}
            sx={sx}
        />
    );
};

export default ListItemIcon;
