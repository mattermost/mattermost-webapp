// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {TourTip, useMeasurePunchouts} from '@mattermost/components';

import {TutorialTourName} from '../constant';
import {useTourTipManager} from '../tour_manager';

interface PlaybooksTourTipProps {
    singleTip: boolean;
    playbookCount?: string;
}

export const PlaybooksTourTip = ({singleTip, playbookCount}: PlaybooksTourTipProps) => {
    const title = (
        <FormattedMessage
            id='pluggable_rhs.tourtip.playbooks.title'
            defaultMessage={'Access your {count} linked playbook run'}
            values={{count: playbookCount === '0' ? undefined : playbookCount}}
        />
    );
    const accessStatement = (
        <li>
            <FormattedMessage
                id='pluggable_rhs.tourtip.playbooks.access'
                defaultMessage={'Access your linked playbooks from the Playbooks icon on the right hand App bar.'}
            />
        </li>
    );
    const clickStatement = (
        <li>
            <FormattedMessage
                id='pluggable_rhs.tourtip.playbooks.click'
                defaultMessage={'Click into playbooks from this right panel.'}
            />
        </li>
    );
    const reviewStatement = (
        <li>
            <FormattedMessage
                id='pluggable_rhs.tourtip.playbooks.review'
                defaultMessage={'Review playbook updates from your channels.'}
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
        return (
            <>
                <FormattedMessage
                    id={'tutorial_tip.ok'}
                    defaultMessage={'Next'}
                />
                <i className='icon icon-chevron-right'/>
            </>
        );
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
            pulsatingDotTranslate={{x: 10, y: -140}}
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

