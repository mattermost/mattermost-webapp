// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {MenuList as MuiMenuList} from '@mui/material';

interface Props {
    id?: string;
    focusOnFirstItem?: boolean;
    children: ReactNode;
}

export function MenuList(props: Props) {
    return (
        <MuiMenuList
            id={props.id}
            autoFocusItem={props.focusOnFirstItem}
            variant='menu'
        >
            {props.children}
        </MuiMenuList>
    );
}
