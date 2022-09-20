// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MUIMenu, {MenuProps as MUIMenuProps} from '@mui/material/Menu';

import {OmitMUIProps} from '../../types';

type MenuProps = OmitMUIProps<MUIMenuProps> & {
    destructive?: boolean;
}

const Menu = (props: MenuProps) => <MUIMenu {...props}/>;

export default Menu;
