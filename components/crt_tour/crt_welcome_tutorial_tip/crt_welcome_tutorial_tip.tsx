// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {Constants} from 'utils/constants';
import {GlobalState} from 'types/store';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import TutorialTip from 'components/tutorial/tutorial_tip_legacy';
import {useMeasurePunchoutsDepricated} from 'components/tutorial/tutorial_tip_legacy/hooks';
import {close as closeLhs} from 'actions/views/lhs';
import {browserHistory} from 'utils/browser_history';

type Props = {
    autoTour: boolean;
};

const CRTWelcomeTutorialTip = ({autoTour}: Props) => {
    const dispatch = useDispatch();
    const teamUrl = useSelector((state: GlobalState) => getCurrentRelativeTeamUrl(state));
    const nextUrl = `${teamUrl}/threads`;
    const onNextNavigateTo = () => {
        browserHistory.push(nextUrl);
        dispatch(closeLhs());
    };

    const title = (
        <FormattedMessage
            id='tutorial_threads.welcome.title'
            defaultMessage={'Welcome to the Threads view!'}
        />
    );

    const screen = (
        <p>
            <FormattedMarkdownMessage
                id='tutorial_threads.welcome.description'
                defaultMessage={'All the conversations that you’re participating in or following will show here. If you have unread messages or mentions within your threads, you’ll see that here too.'}
            />
        </p>
    );

    return (
        <TutorialTip
            title={title}
            onNextNavigateTo={onNextNavigateTo}
            placement='right'
            showOptOut={false}
            step={Constants.CrtTutorialSteps.WELCOME_POPOVER}
            tutorialCategory={Constants.Preferences.CRT_TUTORIAL_STEP}
            screen={screen}
            overlayClass='tip-overlay--threads-welcome '
            autoTour={autoTour}
            punchOut={useMeasurePunchoutsDepricated(['sidebar-threads-button'], [])}
            telemetryTag='tutorial_tip_threads-welcome'
        />
    );
};

export default CRTWelcomeTutorialTip;
