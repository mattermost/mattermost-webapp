// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import TutorialTip from './tutorial_tip';

const MenuTutorialTip = ({toggleFunc, onBottom}) => {
    const screens = [];

    screens.push(
        <div>
            <h4>
                <FormattedMessage
                    id='sidebar_header.tutorial.title'
                    defaultMessage='Main Menu'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar_header.tutorial.body1'
                    defaultMessage='The **Main Menu** is where you can **Invite New Members**, access your **Account Settings** and set your **Theme Color**.'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar_header.tutorial.body2'
                    defaultMessage='Team administrators can also access their **Team Settings** from this menu.'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar_header.tutorial.body3'
                    defaultMessage='System administrators will find a **System Console** option to administrate the entire system.'
                />
            </p>
        </div>,
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
                telemetryTag='tutorial_tip_3_main_menu'
            />
        </div>
    );
};

MenuTutorialTip.propTypes = {
    toggleFunc: PropTypes.func,
    onBottom: PropTypes.bool.isRequired,
};

export default MenuTutorialTip;
