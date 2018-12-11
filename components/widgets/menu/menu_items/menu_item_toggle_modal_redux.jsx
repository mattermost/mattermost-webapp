// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';

import menuItem from './menu_item.jsx';

const MenuItemToggleModalRedux = menuItem(({modalId, dialogType, dialogProps, text}) => (
    <ToggleModalButtonRedux
        role='menuitem'
        modalId={modalId}
        dialogType={dialogType}
        dialogProps={dialogProps}
    >
        {text}
    </ToggleModalButtonRedux>
));
MenuItemToggleModalRedux.displayName = 'MenuItemToggleModalRedux';
export default MenuItemToggleModalRedux;
