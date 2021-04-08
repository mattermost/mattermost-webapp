// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './menu_item.scss';

type MenuItemWrapperProps = {
    show: boolean;
    id?: string;
    children?: React.ReactNode;
}
const MenuItemWrapperProps: React.FC<MenuItemWrapperProps>= ({id, show, children}) => {
    if (!show) {
        return null;
    }

    return (
        <li
            className={'MenuItemWrapper'}
            role='menuitem'
            id={id}
        >
        {children}
        </li>
    );
}
export default MenuItemWrapperProps;
