// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TourTip from 'components/widgets/tour_tip/tour_tip';
import {TourTipOverlayPunchOut} from 'components/widgets/tour_tip/tour_tip_backdrop';

import {getLastStep} from '../onboarding_tour/utils';

import useBoardingTourTipManager from './explore_tools_tour_manager';

type Props = {
    screen: JSX.Element;
    title: JSX.Element;
    imageURL?: string;
    overlayPunchOut: TourTipOverlayPunchOut | null;
    singleTip?: boolean;
    offset?: [number, number];
}

const OnboardingExploreToolsTourTip = ({
    title,
    screen,
    imageURL,
    overlayPunchOut,
    singleTip,
    offset = [-18, 4],
}: Props) => {
    const prevBtn = (
        <>
            <i className='icon icon-chevron-left'/>
            <FormattedMessage
                id='generic.previous'
                defaultMessage='Previous'
            />
        </>
    );
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
        if (singleTip) {
            buttonText = (
                <FormattedMessage
                    id={'tutorial_tip.got_it'}
                    defaultMessage={'Got it'}
                />
            );
            return buttonText;
        }

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
    } = useBoardingTourTipManager();

    return (
        <TourTip
            show={show}
            tourSteps={tourSteps}
            title={title}
            screen={screen}
            imageURL={imageURL}
            overlayPunchOut={overlayPunchOut}
            nextBtn={nextBtn()}
            prevBtn={prevBtn}
            step={currentStep}
            placement={'right-start'}
            pulsatingDotPlacement={'right-start'}
            pulsatingDotTranslate={{x: 10, y: 0}}
            width={352}
            offset={offset}
            handleOpen={handleOpen}
            handleDismiss={handleDismiss}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            handleSkip={handleSkip}
            handleJump={handleJump}
            singleTip={singleTip}
        />
    );
};

export default OnboardingExploreToolsTourTip;
