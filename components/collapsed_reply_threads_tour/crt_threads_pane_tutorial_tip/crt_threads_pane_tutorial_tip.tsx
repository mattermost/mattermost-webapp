// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from '../../formatted_markdown_message';
import TutorialTip from 'components/tutorial/tutorial_tip';
import {Constants, Preferences} from '../../../utils/constants';
import {useMeasurePunchouts} from 'components/tutorial/tutorial_tip/hooks';

const CRTThreadsPaneTutorialTip = () => {
    const screens = [
        <div key='first-screen'>
            <h4>
                <FormattedMessage
                    id='tutorial_threads.threads_pane.title'
                    defaultMessage='Viewing a thread in the sidebar'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='tutorial_threads.threads_pane.description'
                    defaultMessage={'When opening a thread in the sidebar, you can now click the ‘Follow’ button to be notified about replies and to add it to your Threads view. Also within a thread, the “New Messages” line shows you where you left off.'}
                />
            </p>
        </div>,
    ];

    return (
        <TutorialTip
            singleTip={true}
            placement='left'
            showOptOut={true}
            step={Constants.CrtThreadPaneSteps.THREADS_PANE_POPOVER}
            tutorialCategory={Preferences.CRT_THREAD_PANE_STEP}
            screens={screens}
            overlayClass='tip-overlay--threads-pane'
            punchOut={useMeasurePunchouts(['rhsContainer'], [])}
            autoTour={true}
        />
    );
};

export default CRTThreadsPaneTutorialTip;
