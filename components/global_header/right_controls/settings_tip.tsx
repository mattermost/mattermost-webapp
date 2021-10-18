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
                    defaultMessage={'Set your notifications, custom theme colors, sidebar organization, and more from **Settings**. From your avatar, access your profile and security settings through **Account Settings**, and set your status and availability.'}
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
