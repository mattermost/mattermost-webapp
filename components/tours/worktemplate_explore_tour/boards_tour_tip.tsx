// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {TourTip, useMeasurePunchouts} from '@mattermost/components';

import {TutorialTourName} from '../constant';
import {useTourTipManager} from '../tour_manager';
import {getLastStep} from '../utils';

interface BoardsTourTipProps {
    singleTip: boolean;
    boardCount?: string;
}

export const BoardsTourTip = ({singleTip, boardCount}: BoardsTourTipProps) => {
    const title = (
        <FormattedMessage
            id='pluggable_rhs.tourtip.boards.title'
            defaultMessage={'Access your {count} linked boards!'}
            values={{count: boardCount === '0' ? undefined : boardCount}}
        />
    );
    const accessStatement = (
        <li>
            <FormattedMessage
                id='pluggable_rhs.tourtip.boards.access'
                defaultMessage={'Access your linked boards from the Boards icon on the right hand App bar.'}
            />
        </li>
    );
    const clickStatement = (
        <li>
            <FormattedMessage
                id='pluggable_rhs.tourtip.boards.click'
                defaultMessage={'Click into boards from this right panel.'}
            />
        </li>
    );
    const reviewStatement = (
        <li>
            <FormattedMessage
                id='pluggable_rhs.tourtip.boards.review'
                defaultMessage={'Review board updates from your channels.'}
            />
        </li>
    );
    const screen = (
        <ul>
            {accessStatement}
            {clickStatement}
            {reviewStatement}
        </ul>
    );

    const {
        show,
        currentStep,
        tourSteps,
        handleOpen,
        handleDismiss,
        handleNext,
        handlePrevious,
        handleSkip,
        handleJump,
    } = useTourTipManager(TutorialTourName.WORK_TEMPLATE_TUTORIAL);

    const nextBtn = (): JSX.Element => {
        let buttonText = (
            <>
                <FormattedMessage
                    id={'tutorial_tip.ok'}
                    defaultMessage={'Next'}
                />
                <i className='icon icon-chevron-right'/>
            </>
        );
        const lastStep = getLastStep(tourSteps);
        if (currentStep === lastStep) {
            buttonText = (
                <FormattedMessage
                    id={'tutorial_tip.done'}
                    defaultMessage={'Done'}
                />
            );
        }
        return buttonText;
    };

    const overlayPunchOut = useMeasurePunchouts(['sidebar-right'], []);

    return (
        <TourTip
            show={show}
            tourSteps={tourSteps}
            title={title}
            screen={screen}
            singleTip={singleTip}
            overlayPunchOut={overlayPunchOut}
            nextBtn={nextBtn()}
            prevBtn={undefined}
            step={currentStep}
            placement='left-start'
            pulsatingDotPlacement={'left'}
            pulsatingDotTranslate={{x: 10, y: -320}}
            tippyBlueStyle={true}
            showBackdrop={true}
            showOptOut={false}
            handleOpen={handleOpen}
            handleDismiss={handleDismiss}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            handleSkip={handleSkip}
            handleJump={handleJump}
        />
    );
};

