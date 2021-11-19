// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from '../../formatted_markdown_message';
import TutorialTip from 'components/tutorial/tutorial_tip';
import {Constants, Preferences} from '../../../utils/constants';
import {useMeasurePunchouts} from 'components/tutorial/tutorial_tip/hooks';
const CRTThreadsPaneTutorialTip = () => {
    const title = (
        <FormattedMessage
            id='tutorial_threads.threads_pane.title'
            defaultMessage='Viewing a thread in the sidebar'
        />
    );
    const screen = (
        <p>
            <FormattedMarkdownMessage
                id='tutorial_threads.threads_pane.description'
                defaultMessage={'Click the **Follow** button to be notified about replies and see it in your **Threads** view. Within a thread, the **New Messages** line shows you where you left off.'}
            />
        </p>
    );

    return (
        <TutorialTip
            title={title}
            singleTip={true}
            placement='left'
            showOptOut={false}
            step={Constants.CrtThreadPaneSteps.THREADS_PANE_POPOVER}
            tutorialCategory={Preferences.CRT_THREAD_PANE_STEP}
            screen={screen}
            overlayClass='tip-overlay--threads-pane'
            punchOut={useMeasurePunchouts(['rhsContainer'], [])}
            autoTour={true}
        />
    );
};

export default CRTThreadsPaneTutorialTip;
