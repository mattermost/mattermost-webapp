// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useSelector} from 'react-redux';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import TutorialTip from 'components/tutorial/tutorial_tip';
import {Constants} from 'utils/constants';
import {GlobalState} from 'types/store';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {useMeasurePunchouts} from 'components/tutorial/tutorial_tip/hooks';
import {browserHistory} from 'utils/browser_history';

const CRTWelcomeTutorialTip = () => {
    const teamUrl = useSelector((state: GlobalState) => getCurrentRelativeTeamUrl(state));
    const nextUrl = `${teamUrl}/threads`;
    const onNextNavigateTo = () => browserHistory.push(nextUrl);
    const screens = [
        <div key='first-screen'>
            <h4>
                <FormattedMessage
                    id='tutorial_threads.welcome.title'
                    defaultMessage='Welcome to the Threads view!'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='tutorial_threads.welcome.description'
                    defaultMessage={'All the conversations that you’re participating in or following will show here. If you have unread messages or mentions within your threads, you’ll see that here too.'}
                />
            </p>
        </div>,
    ];

    return (
        <TutorialTip
            onNextNavigateTo={onNextNavigateTo}
            placement='right'
            showOptOut={true}
            step={Constants.CrtTutorialSteps.WELCOME_POPOVER}
            tutorialCategory={Constants.Preferences.CRT_TUTORIAL_STEP}
            screens={screens}
            overlayClass='tip-overlay--threads-welcome '
            autoTour={true}
            punchOut={useMeasurePunchouts(['sidebar-threads-button'], [])}
            telemetryTag='tutorial_tip_threads-welcome'
        />
    );
};

export default CRTWelcomeTutorialTip;
