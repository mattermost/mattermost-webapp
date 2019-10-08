// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import BlockableLink from 'components/admin_console/blockable_link';
import menuItem from 'components/widgets/menu/menu_items/menu_item';

export const MenuItemBlockableLinkImpl = ({to, text}) => <BlockableLink to={to}>{text}</BlockableLink>;
MenuItemBlockableLinkImpl.propTypes = {
    to: PropTypes.string.isRequired,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

const MenuItemBlockableLink = menuItem(MenuItemBlockableLinkImpl);
MenuItemBlockableLink.displayName = 'MenuItemBlockableLinkImpl';

export default MenuItemBlockableLink;
