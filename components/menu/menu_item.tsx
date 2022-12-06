// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {MenuItemProps as MuiMenuItemProps} from '@mui/material/MenuItem';
import MuiMenuItem from '@mui/material/MenuItem';

export {styled} from '@mui/material/styles';

export type MenuItemProps = MuiMenuItemProps & {
    isDestructive?: boolean;
}

export const MenuItem = MuiMenuItem;
