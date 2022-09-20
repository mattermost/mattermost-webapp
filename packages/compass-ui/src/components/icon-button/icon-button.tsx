// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MuiIconButton, {IconButtonProps as MuiIconButtonProps} from '@mui/material/IconButton';

type IconButtonProps = MuiIconButtonProps & {
    IconComponent: React.FC;
    compact?: boolean;
}

const IconButton = ({IconComponent, compact = false, sx, ...props}: IconButtonProps) => {
    const sxOverride = compact ? {
        ...sx,
        svg: {
            margin: 0,
        },
    } : {...sx};

    return (
        <MuiIconButton
            {...props}
            sx={sxOverride}
        >
            <IconComponent/>
        </MuiIconButton>
    );
};

export default IconButton;
