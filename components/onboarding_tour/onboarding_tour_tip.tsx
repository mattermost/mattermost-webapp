// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Placement} from 'tippy.js';

import TourTip from 'components/widgets/tour_tip/tour_tip';

import {OnBoardingTourSteps} from '../tutorial_tour_tip/constant';
import {TourTipOverlayPunchOut} from '../widgets/tour_tip/tour_tip_backdrop';

import useBoardingTourTipManager from './onboarding_tour_manager';

import {getLastStep} from './utils';

export type DataEventSource = 'next' | 'prev' | 'dismiss' | 'jump' | 'skipped'

type Props = {
    screen: JSX.Element;
    title: JSX.Element;
    imageURL?: string;
    overlayPunchOut: TourTipOverlayPunchOut | null;
    step: number;
    singleTip?: boolean;
    placement?: Placement;
    pulsatingDotPlacement?: Omit<Placement, 'auto'| 'auto-end'>;
    pulsatingDotTranslate?: {x: number; y: number};
    offset?: [number, number];
    width?: string | number;
}

const OnBoardingTourTip = ({
    title,
    screen,
    imageURL,
    overlayPunchOut,
    singleTip,
    step,
    pulsatingDotTranslate,
    pulsatingDotPlacement,
    offset = [-18, 4],
    placement = 'right-start',
    width = 320,
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
        if (step === lastStep) {
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
        tourSteps,
        handleOpen,
        handleDismiss,
        handleNext,
        handlePrevious,
        handlePunchOut,
        handleSkip,
    } = useBoardingTourTipManager({});

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
            step={OnBoardingTourSteps.SEND_MESSAGE}
            placement={placement}
            pulsatingDotPlacement={pulsatingDotPlacement}
            pulsatingDotTranslate={pulsatingDotTranslate}
            width={width}
            offset={offset}
            handleOpen={handleOpen}
            handleDismiss={handleDismiss}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            handlePunchOut={handlePunchOut}
            handleSkip={handleSkip}
        />
    );
};

export default OnBoardingTourTip;
