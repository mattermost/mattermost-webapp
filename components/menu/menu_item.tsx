// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEventHandler, ReactNode} from 'react';
import {MenuItem as MuiMenuItem} from '@mui/material';

interface Props {
    id?: string;
    onClick?: MouseEventHandler<HTMLLIElement>;
    disabled?: boolean;
    children: ReactNode;
}

export function MenuItem(props: Props) {
    return (
        <MuiMenuItem
            id={props.id}
            component='li'
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.children}
        </MuiMenuItem>
    );
}
