// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import BlockableLink from 'components/admin_console/blockable_link';
import menuItem from 'components/widgets/menu/menu_items/menu_item';

interface MenuItemBlockableLinkImplProps {
    to: string;
    text: string | React.ReactNode;
}

export const MenuItemBlockableLinkImpl: React.SFC<MenuItemBlockableLinkImplProps> = (props: MenuItemBlockableLinkImplProps): JSX.Element => {
    const {to, text} = props;
    return (
        <BlockableLink to={to}>{text}</BlockableLink>
    );
};

const MenuItemBlockableLink = menuItem(MenuItemBlockableLinkImpl);
MenuItemBlockableLink.displayName = 'MenuItemBlockableLinkImpl';

export default MenuItemBlockableLink;
