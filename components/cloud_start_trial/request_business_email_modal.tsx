// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';

import {FormattedMessage, useIntl} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import {ItemStatus, TELEMETRY_CATEGORIES} from 'utils/constants';

import GenericModal from 'components/generic_modal';
import {CustomMessageInputType} from 'components/widgets/inputs/input/input';

import {isEmail} from 'mattermost-redux/utils/helpers';

import StartCloudTrialBtn from './cloud_start_trial_btn';
import InputBusinessEmail from './input_business_email';

import './request_business_email_modal.scss';

type Props = {
    onClose?: () => void;
    onExited: () => void;
}

const RequestBusinessEmailModal = (
    {
        onClose,
        onExited,
    }: Props): JSX.Element | null => {
    const {formatMessage} = useIntl();
    const [email, setEmail] = useState<string>('');
    const [customInputLabel, setCustomInputLabel] = useState<CustomMessageInputType>(null);
    const [trialBtnDisabled, setTrialBtnDisabled] = useState<boolean>(true);

    useEffect(() => {
        trackEvent(
            TELEMETRY_CATEGORIES.REQUEST_BUSINESS_EMAIL,
            'request_business_email',
        );
    }, []);

    const handleOnClose = useCallback(() => {
        if (onClose) {
            onClose();
        }

        onExited();
    }, [onClose, onExited]);

    const handleEmailValues = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setEmail(email.trim().toLowerCase());
        validateEmail(email);
    }, []);

    const validateEmail = useCallback(async (email: string) => {
        // no value set, no validation and clean the custom input label
        if (!email) {
            setCustomInputLabel(null);
            return;
        }

        // function isEmail aready handle empty / null value
        if (!isEmail(email)) {
            const errMsg = formatMessage({id: 'request_business_email_modal.invalidEmail', defaultMessage: 'This doesn\'t look like a valid email'});
            setCustomInputLabel({type: ItemStatus.WARNING, value: errMsg});
            return;
        }

        // go and validate the email against the validateBusinessEmail endpoint
        // TODO: add util load with an email to the endpoint to send the email for validation
        // const isValidBusinessEmail = await validateBusinessEmail()();
        // if (!isValidBusinessEmail) {
        //     const errMsg = formatMessage({id: 'request_business_email_modal.not_business_email', defaultMessage: 'This doesn\'t look like a business email'});
        //     setCustomInputLabel({type: ItemStatus.ERROR, value: errMsg});
        //     return;
        // }

        // if it is a valid business email, proceed, enable the start trial button and notify the user about the email is valid
        const okMsg = formatMessage({id: 'request_business_email_modal.valid_business_email', defaultMessage: 'This is a valid email'});
        setCustomInputLabel({type: ItemStatus.SUCCESS, value: okMsg});
        setTrialBtnDisabled(false);
        setTimeout(() => {
            setCustomInputLabel(null);
        }, 2000);
    }, []);

    return (
        <GenericModal
            className='RequestBusinessEmailModal'
            id='RequestBusinessEmailModal'
            onExited={handleOnClose}
        >
            <div className='start-trial-email-title'>
                <FormattedMessage
                    id='start_cloud_trial.modal.enter_trial_email.title'
                    defaultMessage='Enter an email to start your trial'
                />
            </div>
            <div className='start-trial-email-description'>
                <FormattedMessage
                    id='start_cloud_trial.modal.enter_trial_email.description'
                    defaultMessage='Start a trial and enter a business email to get started. '
                />
            </div>
            <div className='start-trial-email-input'>
                <InputBusinessEmail
                    email={email}
                    handleEmailValues={handleEmailValues}
                    customInputLabel={customInputLabel}
                />
            </div>
            <div className='start-trial-email-disclaimer'>
                <FormattedMessage
                    id='request_business_email.start_trial.modal.disclaimer'
                    defaultMessage='By selecting <highlight>“Start trial”</highlight>, I agree to the <linkEvaluation>Mattermost Software Evaluation Agreement</linkEvaluation>, <linkPrivacy>privacy policy</linkPrivacy> and receiving product emails.'
                    values={{
                        highlight: (msg: React.ReactNode) => (
                            <strong>
                                {msg}
                            </strong>
                        ),
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
            </div>
            <div className='start-trial-button'>
                <StartCloudTrialBtn
                    message={formatMessage({id: 'cloud.startTrial.modal.btn', defaultMessage: 'Start trial'})}
                    telemetryId='request_business_email_modal'
                    disabled={trialBtnDisabled}
                    email={email}
                />
            </div>
        </GenericModal>
    );
};

export default RequestBusinessEmailModal;
