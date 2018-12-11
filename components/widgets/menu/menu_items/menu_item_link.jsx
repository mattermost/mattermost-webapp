// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';

import menuItem from './menu_item.jsx';

const MenuItemLink = menuItem(({to, text}) => <Link to={to}>{text}</Link>);
MenuItemLink.displayName = 'MenuItemLink';
export default MenuItemLink;
