// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import BlockableLink from 'components/admin_console/blockable_link';
import menuItem from 'components/widgets/menu/menu_items/menu_item';

const MenuItemBlockableLink = menuItem(({to, text}) => <BlockableLink to={to}>{text}</BlockableLink>);
MenuItemBlockableLink.displayName = 'MenuItemBlockableLink';
export default MenuItemBlockableLink;
