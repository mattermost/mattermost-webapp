// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Constants, Preferences} from 'utils/constants';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import TutorialTip from 'components/tutorial/tutorial_tip_legacy';
import {useMeasurePunchoutsDeprecated} from 'components/tutorial/tutorial_tip_legacy/hooks';
import TourTip, { useMeasurePunchouts } from 'components/widgets/tour_tip';

const translate = {x: 2, y: 25};

const CRTThreadsPaneTutorialTip = () => {
    const title = (
        <FormattedMessage
            id='tutorial_threads.threads_pane.title'
            defaultMessage={'Viewing a thread in the sidebar'}
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

    const nextBtn = (): JSX.Element => {
        return (
            <FormattedMessage
                id={'tutorial_tip.got_it'}
                defaultMessage={'Got it'}
            />
        );
    };

    const onDismiss = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    const overlayPunchOut = useMeasurePunchouts(['rhsContainer'], []);

    return (
        <TourTip
            show={true}
            screen={screen}
            title={title}
            overlayPunchOut={overlayPunchOut}
            placement='left'
            pulsatingDotPlacement='top-start'
            pulsatingDotTranslate={translate}
            step={1}
            singleTip={true}
            showOptOut={false}
            handleDismiss={onDismiss}
            handleNext={onDismiss}
            interactivePunchOut={true}
            nextBtn={nextBtn()}
        />
    );
};

export default CRTThreadsPaneTutorialTip;
