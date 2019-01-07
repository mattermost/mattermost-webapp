// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import menuItem from './menu_item.jsx';

export const MenuItemExternalLinkImpl = ({url, text}) => (
    <a
        target='_blank'
        rel='noopener noreferrer'
        href={url}
    >
        {text}
    </a>
);
MenuItemExternalLinkImpl.propTypes = {
    url: PropTypes.string.isRequired,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

const MenuItemExternalLink = menuItem(MenuItemExternalLinkImpl);
MenuItemExternalLink.displayName = 'MenuItemExternalLink';
export default MenuItemExternalLink;
