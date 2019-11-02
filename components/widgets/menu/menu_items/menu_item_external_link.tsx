// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import menuItem from './menu_item';

type Props = {
    url: string;
    text: React.ReactNode;
}
export const MenuItemExternalLinkImpl: React.FC<Props> = ({url, text}: Props) => (
    <a
        target='_blank'
        rel='noopener noreferrer'
        href={url}
    >
        {text}
    </a>
);

const MenuItemExternalLink = menuItem(MenuItemExternalLinkImpl);
MenuItemExternalLink.displayName = 'MenuItemExternalLink';
export default MenuItemExternalLink;
