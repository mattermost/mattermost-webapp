// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Divider} from '@mui/material';

/**
 * A horizontal divider for use in menus.
 * @example
 * <Menu.Container>
 *   <Menu.Item>
 *   <Menu.Divider />
 */
export function MenuItemDivider() {
    return (
        <Divider
            component='li'
            aria-hidden={true}
        />
    );
}
