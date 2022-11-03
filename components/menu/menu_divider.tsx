// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Divider} from '@mui/material';

interface Props {
    className?: string;
}

export function MenuDivider(props: Props) {
    return (
        <Divider
            component='li'
            classes={props.className}
        />
    );
}
