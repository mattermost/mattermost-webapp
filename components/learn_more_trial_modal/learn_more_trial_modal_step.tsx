// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useDispatch} from 'react-redux';

import {FormattedMessage, useIntl} from 'react-intl';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {closeModal} from 'actions/views/modals';

import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';

import {ModalIdentifiers} from 'utils/constants';

import StartTrialBtn from './start_trial_btn';

import './learn_more_trial_modal_step.scss';

export type LearnMoreTrialModalStepProps = {
    id: string;
    title: string;
    description: string;
    svgWrapperClassName: string;
    svgElement: React.ReactNode;
    bottomLeftMessage?: string;
    handleEmbargoError?: () => void;
    isCloudFree?: boolean;
}

const LearnMoreTrialModalStep = (
    {
        id,
        title,
        description,
        svgWrapperClassName,
        svgElement,
        bottomLeftMessage,
        handleEmbargoError,
        isCloudFree,
    }: LearnMoreTrialModalStepProps) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();

    let startTrialBtnMsg = formatMessage({id: 'start_trial.modal_btn.start_free_trial', defaultMessage: 'Start free 30-day trial'});

    // close this modal once start trial btn is clicked and trial has started successfully
    const dismissAction = () => {
        dispatch(closeModal(ModalIdentifiers.LEARN_MORE_TRIAL_MODAL));
    };

    let startTrialBtn = (
        <StartTrialBtn
            message={startTrialBtnMsg}
            handleEmbargoError={handleEmbargoError}
            telemetryId='start_trial_from_learn_more_about_trial_modal'
            onClick={dismissAction}
        />
    );

    // no need to check if is cloud trial or if it have had prev cloud trial cause the button that show this modal takes care of that
    if (isCloudFree) {
        startTrialBtnMsg = formatMessage({id: 'menu.cloudFree.tryFreeFor30Days', defaultMessage: 'Try free for 30 days'});
        startTrialBtn = (
            <CloudStartTrialButton
                message={startTrialBtnMsg}
                telemetryId={'start_cloud_trial_from_learn_more_about_trial_modal'}
                onClick={dismissAction}
                extraClass={'btn btn-primary start-cloud-trial-btn'}
            />
        );
    }

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
            {startTrialBtn}
            <div className='disclaimer'>
                <span>
                    <FormattedMessage
                        id='start_trial.modal.disclaimer'
                        defaultMessage='By clicking “Start trial”, I agree to the <linkEvaluation>Mattermost Software Evaluation Agreement</linkEvaluation>, <linkPrivacy>privacy policy</linkPrivacy> and receiving product emails.'
                        values={{
                            linkEvaluation: (msg: React.ReactNode) => (
                                <a
                                    href='https://mattermost.com/software-evaluation-agreement'
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    {msg}
                                </a>
                            ),
                            linkPrivacy: (msg: React.ReactNode) => (
                                <a
                                    href='https://mattermost.com/privacy-policy/'
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    {msg}
                                </a>
                            ),
                        }}
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
