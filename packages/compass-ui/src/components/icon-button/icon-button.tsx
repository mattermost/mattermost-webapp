// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MuiIconButton, {IconButtonProps as MuiIconButtonProps} from '@mui/material/IconButton';

import {OmitMUIProps} from '../../types';

type IconButtonProps = OmitMUIProps<MuiIconButtonProps> & {
    IconComponent: React.FC;
    compact?: boolean;
}

const IconButton = ({IconComponent, compact = false, ...props}: IconButtonProps) => {
    const sx = compact ? {
        svg: {
            margin: 0,
        },
    } : null;

    return (
        <MuiIconButton
            {...props}
            sx={sx}
        >
            <IconComponent/>
        </MuiIconButton>
    );
};

export default IconButton;
