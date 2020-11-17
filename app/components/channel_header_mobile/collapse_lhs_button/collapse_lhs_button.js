// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import NotifyCounts from 'components/notify_counts';
import MenuIcon from 'components/widgets/icons/menu_icon';

const CollapseLhsButton = ({
    actions: {
        toggleLhs,
    },
}) => (
    <button
        key='navbar-toggle-sidebar'
        type='button'
        className='navbar-toggle'
        data-toggle='collapse'
        data-target='#sidebar-nav'
        onClick={toggleLhs}
    >
        <span className='sr-only'>
            <FormattedMessage
                id='navbar.toggle2'
                defaultMessage='Toggle sidebar'
            />
        </span>
        <MenuIcon className='style--none icon icon__menu icon--sidebarHeaderTextColor'/>
        <NotifyCounts/>
    </button>
);

CollapseLhsButton.propTypes = {
    actions: PropTypes.shape({
        toggleLhs: PropTypes.func.isRequired,
    }).isRequired,
};

export default CollapseLhsButton;
