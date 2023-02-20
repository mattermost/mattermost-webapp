// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import {Placement} from 'tippy.js';

import {setAutoShowLinkedBoardPreference} from 'mattermost-redux/actions/boards';

import {TourTip} from '@mattermost/components';

type Props = {
    pulsatingDotPlacement?: Omit<Placement, 'auto'| 'auto-end'>;
}

const AutoShowLinkedBoardTourTip = ({
    pulsatingDotPlacement = 'auto',
}: Props): JSX.Element | null => {
    const dispatch = useDispatch();

    const title = (
        <FormattedMessage
            id='autoShowLinkedBoard.tutorialTip.title'
            defaultMessage='Link kanban boards to channels'
        />
    );

    const screen = (
        <FormattedMessage
            id='autoShowLinkedBoard.tutorialTip.description'
            defaultMessage='Manage tasks, plan sprints, conduct standup with the help of kanban boards and tables.'
        />
    );

    const handleDismiss = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setAutoShowLinkedBoardPreference());
    }, []);

    const handleOpen = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        dispatch(setAutoShowLinkedBoardPreference());
    }, []);

    const nextBtn = (
        <FormattedMessage
            id={'tutorial_tip.done'}
            defaultMessage={'Done'}
        />
    );

    return (
        <TourTip
            show={true}
            screen={screen}
            title={title}
            overlayPunchOut={null}
            placement='left-start'
            pulsatingDotPlacement={pulsatingDotPlacement}
            step={1}
            singleTip={true}
            showOptOut={false}
            interactivePunchOut={true}
            handleDismiss={handleDismiss}
            handleOpen={handleOpen}
            handlePrevious={handleDismiss}
            pulsatingDotTranslate={{x: -10, y: 70}}
            tippyBlueStyle={true}
            showBackdrop={false}
            nextBtn={nextBtn}
            handleNext={handleDismiss}
        />
    );
};

export default AutoShowLinkedBoardTourTip;
