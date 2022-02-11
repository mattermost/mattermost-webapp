// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import {FormattedMessage} from 'react-intl';
import Tippy from '@tippyjs/react';
import {Placement} from 'tippy.js';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/animations/scale-subtle.css';
import 'tippy.js/animations/perspective-subtle.css';
import PulsatingDot from 'components/widgets/pulsating_dot';

import TourTipBackdrop, {TourTipOverlayPunchOut} from './tour_tip_backdrop';
import './tour_tip.scss';

// This needs to be changed if root-portal node isn't available to maybe to body
const rootPortal = document.getElementById('root-portal');

export type TourTipEventSource = 'next' | 'prev' | 'dismiss' | 'jump' | 'skipped' | 'open' | 'punchOut'

type Props = {
    show: boolean;
    screen: JSX.Element;
    title: JSX.Element;
    step: number;

    tourSteps?: Record<string, number>;
    nextBtn?: JSX.Element;
    prevBtn?: JSX.Element;
    imageURL?: string;
    singleTip?: boolean;
    showOptOut?: boolean;
    placement?: Placement;
    pulsatingDotPlacement?: Omit<Placement, 'auto'| 'auto-end'>;
    pulsatingDotTranslate?: {x: number; y: number};
    offset?: [number, number];
    width?: string | number;
    zIndex?: number;

    // if you don't want punchOut just assign FULL, keep null as hook may return null first than actual value
    overlayPunchOut: TourTipOverlayPunchOut | null;

    // if we want to interact with element visible via punchOut
    interactivePunchOut?: boolean;

    handleOpen?: (e: React.MouseEvent) => void;
    handleNext?: (e: React.MouseEvent) => void;
    handlePrevious?: (e: React.MouseEvent) => void;
    handleJump?: (e: React.MouseEvent, jumpToStep: number) => void;
    handleSkip?: (e: React.MouseEvent) => void;
    handleDismiss?: (e: React.MouseEvent) => void;
    handlePunchOut?: (e: React.MouseEvent) => void;
}

const TourTip = ({
    title,
    screen,
    imageURL,
    overlayPunchOut,
    singleTip,
    step,
    show,
    interactivePunchOut,
    tourSteps,
    handleOpen,
    handleDismiss,
    handleNext,
    handlePrevious,
    handleSkip,
    handleJump,
    handlePunchOut,
    pulsatingDotTranslate,
    pulsatingDotPlacement,
    nextBtn,
    prevBtn,
    offset = [-18, 4],
    placement = 'right-start',
    showOptOut = true,
    width = 352,
    zIndex = 999,
}: Props) => {
    const triggerRef = useRef(null);
    const onJump = (event: React.MouseEvent, jumpToStep: number) => {
        if (handleJump) {
            handleJump(event, jumpToStep);
        }
    };
    const dots = [];
    if (!singleTip && tourSteps) {
        for (let dot = 0; dot < (Object.values(tourSteps).length - 1); dot++) {
            let className = 'tour-tip__dot';
            let circularRing = 'tour-tip__dot-ring';

            if (dot === step) {
                className += ' active';
                circularRing += ' tour-tip__dot-ring-active';
            }

            dots.push(
                <div className={circularRing}>
                    <a
                        href='#'
                        key={'dotactive' + dot}
                        className={className}
                        data-screen={dot}
                        onClick={(e) => onJump(e, dot)}
                    />
                </div>,
            );
        }
    }

    const content = (
        <>
            <div className='tour-tip__header'>
                <h4 className='tour-tip__header__title'>
                    {title}
                </h4>
                <button
                    className='tour-tip__header__close'
                    onClick={handleDismiss}
                >
                    <i className='icon icon-close'/>
                </button>
            </div>
            <div className='tour-tip__body'>
                {screen}
            </div>
            {imageURL && (
                <div className='tour-tip__image'>
                    <img
                        src={imageURL}
                        alt={'tutorial tour tip product image'}
                    />
                </div>
            )}
            {(nextBtn || prevBtn || showOptOut) && (<div className='tour-tip__footer'>
                <div className='tour-tip__footer-buttons'>
                    <div className='tour-tip__circles-ctr'>{dots}</div>
                    <div className={'tour-tip__btn-ctr'}>
                        {step !== 0 && prevBtn && (
                            <button
                                id='tipPreviousButton'
                                className='tour-tip__btn tour-tip__cancel-btn'
                                onClick={handlePrevious}
                            >
                                {prevBtn}
                            </button>
                        )}
                        {nextBtn && (
                            <button
                                id='tipNextButton'
                                className='tour-tip__btn tour-tip__confirm-btn'
                                onClick={handleNext}
                            >
                                {nextBtn}
                            </button>
                        )}
                    </div>
                </div>
                {showOptOut && (
                    <div className='tour-tip__opt'>
                        <FormattedMessage
                            id='tutorial_tip.seen'
                            defaultMessage='Seen this before? '
                        />
                        <a
                            href='#'
                            onClick={handleSkip}
                        >
                            <FormattedMessage
                                id='tutorial_tip.out'
                                defaultMessage='Opt out of these tips.'
                            />
                        </a>
                    </div>
                )}
            </div>
            )}
        </>
    );

    return (
        <>
            <div
                ref={triggerRef}
                onClick={handleOpen}
                className='tour-tip__pulsating-dot-ctr'
                data-pulsating-dot-placement={pulsatingDotPlacement || 'right'}
                style={{
                    transform: `translate(${pulsatingDotTranslate?.x}px, ${pulsatingDotTranslate?.y}px)`,
                }}
            >
                <PulsatingDot/>
            </div>
            <TourTipBackdrop
                show={show}
                onDismiss={handleDismiss}
                onPunchOut={handlePunchOut}
                interactivePunchOut={interactivePunchOut}
                overlayPunchOut={overlayPunchOut}
                appendTo={rootPortal!}
            />
            {show && (
                <Tippy
                    showOnCreate={show}
                    content={content}
                    animation='scale-subtle'
                    trigger='click'
                    duration={[250, 150]}
                    maxWidth={width}
                    aria={{content: 'labelledby'}}
                    allowHTML={true}
                    zIndex={zIndex}
                    reference={triggerRef}
                    interactive={true}
                    appendTo={rootPortal!}
                    offset={offset}
                    className={'tour-tip__box'}
                    placement={placement}
                />
            )}
        </>
    );
};

export default TourTip;
