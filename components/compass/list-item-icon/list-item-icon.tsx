// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MUIListItemIcon, {ListItemIconProps as MUIListItemIconProps} from '@mui/material/ListItemIcon';

type ListItemIconProps = MUIListItemIconProps & {
    position?: 'start' | 'end';
}

const ListItemIcon = ({position = 'start', ...props}: ListItemIconProps) => {
    const sx = position === 'end' ? {
        padding: '0 0 0 18px',
    } : {};

    return (
        <MUIListItemIcon
            {...props}
            sx={sx}
        />
    );
};

export default ListItemIcon;
