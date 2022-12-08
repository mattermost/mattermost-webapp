// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Divider} from '@mui/material';

/**
 * A horizontal divider for use in menus.
 * @example
 * <Menu>
 *   <MenuItem>Menu Item 1</MenuItem>
 *   <MenuItemDivider />
 *   <MenuItem>Menu Item 2</MenuItem>
 * </Menu>
 */
export function MenuItemDivider() {
    return (
        <Divider
            component='li'
            aria-hidden={true}
        />
    );
}
