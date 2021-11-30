// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import TutorialTip from 'components/tutorial/tutorial_tip';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import {getAnnouncementBarCount} from 'selectors/views/announcement_bar';
import {TutorialSteps} from 'utils/constants';

// On first render, the global header may not have painted to screen,
// so we use this as a fallback.
const noBarPunchout = {
    x: '0px',
    y: '0px',
    width: '100%',
    height: '40px',
};

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
                    defaultMessage={'Under Profile, set your availability, add a custom status, and set your profile picture. Select **Settings** to customize your experience, including notification preferences, custom theme colors, and more.'}
                />
            </p>
        </div>,
    ];
    const isAnnouncementBarOpen = useSelector(getAnnouncementBarCount) > 0;
    const globalHeaderPunchout = useMemo(() => {
        const headerRect = document.getElementById('global-header')?.getBoundingClientRect();
        return headerRect ? {
            x: `${headerRect.x}px`,
            y: `${headerRect.y}px`,
            width: `${headerRect.width}px`,
            height: `${headerRect.height}px`,
        } : noBarPunchout;
    }, [isAnnouncementBarOpen]);

    return (
        <TutorialTip
            placement='bottom'
            screens={screens}
            step={TutorialSteps.SETTINGS}
            overlayClass='tip-overlay--settings'
            telemetryTag='tutorial_tip_settings'
            punchOut={globalHeaderPunchout}
        />
    );
}
