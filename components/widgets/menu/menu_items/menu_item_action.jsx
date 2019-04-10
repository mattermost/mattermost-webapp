// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import menuItem from './menu_item.jsx';

export const MenuItemActionImpl = ({onClick, text, extraText}) => (
    <button
        className={'style--none' + (extraText ? ' MenuItem__help' : '')}
        onClick={onClick}
    >
        <span>{text}</span>
        {extraText && <span className='extra-text'>{extraText}</span>}
    </button>
);
MenuItemActionImpl.propTypes = {
    onClick: PropTypes.func.isRequired,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    extraText: PropTypes.string,
};

const MenuItemAction = menuItem(MenuItemActionImpl);
MenuItemAction.displayName = 'MenuItemAction';

export default MenuItemAction;
