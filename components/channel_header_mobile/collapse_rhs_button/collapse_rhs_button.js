// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import MenuIcon from 'components/widgets/icons/menu_icon';

const CollapseRhsButton = ({
    actions: {
        toggleRhsMenu,
    },
}) => (
    <button
        key='navbar-toggle-menu'
        type='button'
        className='navbar-toggle navbar-right__icon menu-toggle pull-right'
        data-toggle='collapse'
        data-target='#sidebar-nav'
        onClick={toggleRhsMenu}
    >
        <MenuIcon/>
    </button>
);

CollapseRhsButton.propTypes = {
    actions: PropTypes.shape({
        toggleRhsMenu: PropTypes.func.isRequired,
    }).isRequired,
};

export default CollapseRhsButton;
