// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage, useIntl} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import StartTrialBtn from './start_trial_btn';

import './learn_more_trial_modal_step.scss';

export type LearnMoreTrialModalStepProps = {
    id: string;
    title: string;
    description: string;
    svgWrapperClassName: string;
    svgElement: React.ReactNode;
    bottomLeftMessage?: string;
}

const LearnMoreTrialModalStep = (
    {
        id,
        title,
        description,
        svgWrapperClassName,
        svgElement,
        bottomLeftMessage,
    }: LearnMoreTrialModalStepProps) => {
    const {formatMessage} = useIntl();

    const startTrialBtnMsg = formatMessage({id: 'start_trial.modal_btn.start_free_trial', defaultMessage: 'Start free 30-day trial'});

    return (
        <div
            id={`learnMoreTrialModalStep-${id}`}
            className='LearnMoreTrialModalStep slide-container'
        >
            <div className={`${svgWrapperClassName} svg-wrapper`}>
                {svgElement}
            </div>
            <div className='pre-title'>
                <FormattedMessage
                    id='learn_more_trial_modal.pretitle'
                    defaultMessage='With Enterprise, you can...'
                />
            </div>
            <div className='title'>
                {title}
            </div>
            <div className='description'>
                {description}
            </div>
            <StartTrialBtn
                message={startTrialBtnMsg}
                telemetryId='start_trial_from_learn_more_about_trial_modal'
            />
            <div className='disclaimer'>
                <span>
                    <FormattedMarkdownMessage
                        id='start_trial.modal.disclaimer'
                        defaultMessage='By clicking “Start trial”, I agree to the [Mattermost Software Evaluation Agreement,](!https://mattermost.com/software-evaluation-agreement) [privacy policy,](!https://mattermost.com/privacy-policy/) and receiving product emails.'
                    />
                </span>
            </div>
            {bottomLeftMessage && (
                <div className='bottom-text-left-message'>
                    {bottomLeftMessage}
                </div>
            )}
        </div>
    );
};

export default LearnMoreTrialModalStep;
