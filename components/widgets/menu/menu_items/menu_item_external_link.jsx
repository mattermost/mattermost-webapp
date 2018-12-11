// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import menuItem from './menu_item.jsx';

const MenuItemExternalLink = menuItem(({url, text}) => (
    <a
        target='_blank'
        rel='noopener noreferrer'
        href={url}
    >
        {text}
    </a>
));
MenuItemExternalLink.displayName = 'MenuItemExternalLink';
export default MenuItemExternalLink;
