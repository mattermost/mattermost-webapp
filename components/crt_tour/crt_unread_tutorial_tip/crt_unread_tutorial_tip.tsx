// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import TutorialTip from 'components/tutorial/tutorial_tip_legacy';
import {Constants, Preferences} from 'utils/constants';
import {useMeasurePunchoutsDeprecated} from 'components/tutorial/tutorial_tip_legacy/hooks';

type Props = {
    autoTour: boolean;
};

const CRTUnreadTutorialTip = ({autoTour}: Props) => {
    const title = (
        <FormattedMessage
            id='tutorial_threads.unread.title'
            defaultMessage={'Unread threads'}
        />
    );

    const screen = (
        <p>
            <FormattedMarkdownMessage
                id='tutorial_threads.unread.description'
                defaultMessage={'You can switch to **Unreads** to show only threads that are unread.'}
            />
        </p>
    );

    return (
        <TutorialTip
            title={title}
            placement='bottom'
            showOptOut={false}
            step={Constants.CrtTutorialSteps.UNREAD_POPOVER}
            tutorialCategory={Preferences.CRT_TUTORIAL_STEP}
            screen={screen}
            overlayClass='tip-overlay--threads-unread'
            autoTour={autoTour}
            punchOut={useMeasurePunchoutsDeprecated(['threads-list-unread-button'], [])}
        />
    );
};

export default CRTUnreadTutorialTip;
