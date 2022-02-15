// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import TrialBenefitsModalStepMore from './trial_benefits_modal_step_more';

import './trial_benefits_modal_step.scss';

export type TrialBenefitsModalStepProps = {
    id: string;
    title: string;
    description: string;
    svgWrapperClassName: string;
    svgElement: React.ReactNode;
    bottomLeftMessage?: string;
    pageURL?: string;
    onClose?: () => void;
}

const TrialBenefitsModalStep = (
    {
        id,
        title,
        description,
        svgWrapperClassName,
        svgElement,
        bottomLeftMessage,
        pageURL,
        onClose,
    }: TrialBenefitsModalStepProps) => {
    const {formatMessage} = useIntl();

    return (
        <div
            id={`trialBenefitsModalStep-${id}`}
            className='TrialBenefitsModalStep slide-container'
        >
            <div className='title'>
                {title}
            </div>
            <div className='description'>
                {description}
            </div>
            {pageURL && (
                <TrialBenefitsModalStepMore
                    route={pageURL}
                    message={formatMessage({id: 'benefits_trial.modal.learnMore', defaultMessage: 'Learn More'})}
                    onClick={onClose}
                />
            )}
            <div className={`${svgWrapperClassName} svg-wrapper`}>
                {svgElement}
            </div>
            {bottomLeftMessage && (
                <div className='bottom-text-left-message'>
                    {bottomLeftMessage}
                </div>
            )}
        </div>
    );
};

export default TrialBenefitsModalStep;
