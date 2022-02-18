// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useDispatch} from 'react-redux';

import {FormattedMessage, useIntl} from 'react-intl';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {ModalIdentifiers} from 'utils/constants';

import TrialBenefitsModal from 'components/trial_benefits_modal/trial_benefits_modal';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import {openModal} from 'actions/views/modals';

import StartTrialBtn from './start_trial_btn';

import './learn_more_trial_modal_step.scss';

export type LearnMoreTrialModalStepProps = {
    id: string;
    title: string;
    description: string;
    svgWrapperClassName: string;
    svgElement: React.ReactNode;
    bottomLeftMessage?: string;
    buttonLabel: string;
    pageURL?: string;
    onClose?: () => void;
}

const LearnMoreTrialModalStep = (
    {
        id,
        title,
        description,
        svgWrapperClassName,
        svgElement,
        bottomLeftMessage,

        // onClose,
    }: LearnMoreTrialModalStepProps) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();

    const startTrialBtnMsg = formatMessage({id: 'start_trial.modal_btn.start_free_trial', defaultMessage: 'Start free 30-day trial'});

    const openTrialBenefitsModal = async () => {
        await dispatch(openModal({
            modalId: ModalIdentifiers.TRIAL_BENEFITS_MODAL,
            dialogType: TrialBenefitsModal,
            dialogProps: {trialJustStarted: true},
        }));
    };

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
                    defaultMessage='With Enterprise, you can....'
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
                onClick={openTrialBenefitsModal}
            />
            <div className='disclaimer'>
                <span>
                    <FormattedMarkdownMessage
                        id='start_trial.modal.disclaimer'
                        defaultMessage='By clicking “Start trial”, I agree to the [Mattermost Software Evaluation Agreement,](!https://mattermost.com/software-evaluation-agreement) [privacy policy,](!https://about.mattermost.com/default-privacy-policy/) and receiving product emails.'
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
