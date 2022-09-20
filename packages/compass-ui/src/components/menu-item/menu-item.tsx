// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MUIMenuItem, {MenuItemProps as MUIMenuItemProps} from '@mui/material/MenuItem';

import {OmitMUIProps} from '../../types';

type MenuItemProps = OmitMUIProps<MUIMenuItemProps> & {
    destructive?: boolean;
}

const MenuItem = (props: MenuItemProps) => <MUIMenuItem {...props}/>;

export default MenuItem;
