// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import menuItem from './menu_item.jsx';

const MenuItemAction = menuItem(({onClick, text, extraText}) => (
    <button
        className='style--none'
        onClick={onClick}
    >
        {text}
        {extraText && <br/>}
        {extraText && <span className='extra-text'>{extraText}</span>}
    </button>
));
MenuItemAction.displayName = 'MenuItemAction';

export default MenuItemAction;
