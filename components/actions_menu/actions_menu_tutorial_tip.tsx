// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import TourTip from 'components/widgets/tour_tip';

const translate = {x: 6, y: -16};

type Props = {
    handleNext: (e: React.MouseEvent) => void;
    handleOpen: (e: React.MouseEvent) => void;
    handleDismiss: () => void;
    showTip: boolean;
}

const title = (
    <FormattedMessage
        id='post_info.actions.tutorialTip.title'
        defaultMessage='Actions for messages'
    />
);
const screen = (
    <FormattedMarkdownMessage
        id='post_info.actions.tutorialTip'
        defaultMessage='Message actions that are provided\nthrough apps, integrations or plugins\nhave moved to this menu item.'
    />
);
const nextBtn = (
    <FormattedMessage
        id={'tutorial_tip.got_it'}
        defaultMessage={'Got it'}
    />
);

export const ActionsTutorialTip = ({handleOpen, handleDismiss, handleNext, showTip}: Props) => {
    const onDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleDismiss();
    };

    return (
        <TourTip
            show={showTip}
            screen={screen}
            title={title}
            overlayPunchOut={null}
            placement='top'
            pulsatingDotPlacement='left'
            pulsatingDotTranslate={translate}
            step={1}
            singleTip={true}
            showOptOut={false}
            interactivePunchOut={true}
            handleDismiss={onDismiss}
            handleNext={handleNext}
            handleOpen={handleOpen}
            nextBtn={nextBtn}
        />
    );
};
