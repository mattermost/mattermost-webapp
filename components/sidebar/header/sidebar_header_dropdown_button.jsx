// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import MenuIcon from 'components/svg/menu_icon';
import Constants from 'utils/constants.jsx';

export default class SidebarHeaderDropdownButton extends React.PureComponent {
    static propTypes = {
        bsRole: PropTypes.oneOf(['toggle']).isRequired, // eslint-disable-line react/no-unused-prop-types
        onClick: PropTypes.func.isRequired,
    };

    render() {
        const mainMenuToolTip = (
            <Tooltip id='main-menu__tooltip'>
                <FormattedMessage
                    id='sidebar.mainMenu'
                    defaultMessage='Main menu'
                />
            </Tooltip>
        );

        return (
            <OverlayTrigger
                trigger={['hover', 'focus']}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='right'
                overlay={mainMenuToolTip}
            >
                <button
                    id='sidebarHeaderDropdownButton'
                    className='sidebar-header-dropdown__toggle cursor--pointer style--none'
                    onClick={this.props.onClick}
                >
                    <MenuIcon className='sidebar-header-dropdown__icon'/>
                </button>
            </OverlayTrigger>
        );
    }
}
