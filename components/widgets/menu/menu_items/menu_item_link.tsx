// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';

import menuItem from './menu_item';

type Props = {
    to: string;
    text: React.ReactNode;
}

export const MenuItemLinkImpl: React.FC<Props> = ({to, text}: Props) => <Link to={to}><span className='MenuItem__primary-text'>{text}</span></Link>;

const MenuItemLink = menuItem(MenuItemLinkImpl);
MenuItemLink.displayName = 'MenuItemLink';

export default MenuItemLink;
