// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import menuItem from './menu_item.jsx';

export const MenuItemLinkImpl = ({to, text}) => <Link to={to}>{text}</Link>;
MenuItemLinkImpl.propTypes = {
    to: PropTypes.string.isRequired,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

const MenuItemLink = menuItem(MenuItemLinkImpl);
MenuItemLink.displayName = 'MenuItemLink';

export default MenuItemLink;
