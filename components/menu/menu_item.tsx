// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEventHandler, ReactNode} from 'react';
import {MenuItem as MuiMenuItem} from '@mui/material';

interface Props {
    id?: string;
    onClick?: MouseEventHandler<HTMLLIElement>;
    onMouseEnter?: MouseEventHandler<HTMLLIElement>;
    onMouseLeave?: MouseEventHandler<HTMLLIElement>;
    disabled?: boolean;
    children: ReactNode;
}

export function MenuItem(props: Props) {
    return (
        <MuiMenuItem
            component='li'
            disableRipple={true}
            {...props}
        >
            {props.children}
        </MuiMenuItem>
    );
}
