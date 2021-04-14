// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './menu_item.scss';

type MenuTopNotificationProps = {
    show: boolean;
    id?: string;
    children?: React.ReactNode;
}
const MenuTopNotification: React.FC<MenuTopNotificationProps> = ({id, show, children}: MenuTopNotificationProps) => {
    if (!show) {
        return null;
    }

    return (
        <li
            className={'MenuTopNotification'}
            role='menuitem'
            id={id}
        >
            {children}
        </li>
    );
};
export default MenuTopNotification;
