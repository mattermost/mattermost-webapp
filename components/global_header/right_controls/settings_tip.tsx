// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TutorialTip from 'components/tutorial/tutorial_tip';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default function SettingsTip() {
    const screens = [
        <div key='first-screen'>
            <h4>
                <FormattedMessage
                    id='sidebar.tutorialSettings.title'
                    defaultMessage='Customize your experience'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar.tutorialSettings.settings'
                    defaultMessage={'From your Avatar, set your availability, add a custom status, and manage your profile. Access customize notification preferences, custom theme colors, and more in **Settings**.'}
                />
            </p>
        </div>,
    ];

    return (
        <TutorialTip
            placement='bottom'
            screens={screens}
            overlayClass='tip-overlay--settings'
            telemetryTag='tutorial_tip_settings'
        />
    );
}
