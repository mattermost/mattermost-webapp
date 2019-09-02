// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';

import menuItem from './menu_item.jsx';

export const MenuItemToggleModalReduxImpl = ({modalId, dialogType, dialogProps, text}) => (
    <ToggleModalButtonRedux
        accessibilityLabel={text}
        modalId={modalId}
        dialogType={dialogType}
        dialogProps={dialogProps}
    >
        {text}
    </ToggleModalButtonRedux>
);

MenuItemToggleModalReduxImpl.propTypes = {
    modalId: PropTypes.string.isRequired,
    dialogType: PropTypes.func.isRequired,
    dialogProps: PropTypes.object,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

const MenuItemToggleModalRedux = menuItem(MenuItemToggleModalReduxImpl);
MenuItemToggleModalRedux.displayName = 'MenuItemToggleModalRedux';

export default MenuItemToggleModalRedux;
