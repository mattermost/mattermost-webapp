// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
//
import React from 'react';
import PropTypes from 'prop-types';
import {FormattedHTMLMessage} from 'react-intl';

import TutorialTip from './tutorial_tip';

const MenuTutorialTip = ({toggleFunc, onBottom}) => {
    const screens = [];

    screens.push(
        <div>
            <FormattedHTMLMessage
                id='sidebar_header.tutorial'
                defaultMessage='<h4>Main Menu</h4>
                <p>The <strong>Main Menu</strong> is where you can <strong>Invite New Members</strong>, access your <strong>Account Settings</strong> and set your <strong>Theme Color</strong>.</p>
                <p>Team administrators can also access their <strong>Team Settings</strong> from this menu.</p><p>System administrators will find a <strong>System Console</strong> option to administrate the entire system.</p>'
            />
        </div>
    );

    let placement = 'right';
    let arrow = 'left';
    if (onBottom) {
        placement = 'bottom';
        arrow = 'up';
    }

    return (
        <div
            onClick={toggleFunc}
        >
            <TutorialTip
                placement={placement}
                screens={screens}
                overlayClass={'tip-overlay--header--' + arrow}
                diagnosticsTag='tutorial_tip_3_main_menu'
            />
        </div>
    );
};

MenuTutorialTip.propTypes = {
    toggleFunc: PropTypes.func,
    onBottom: PropTypes.bool.isRequired,
};

export default MenuTutorialTip;
