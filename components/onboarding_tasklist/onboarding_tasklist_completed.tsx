// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect} from 'react';
import {CSSTransition} from 'react-transition-group';
import styled from 'styled-components';

import {FormattedMessage} from 'react-intl';

import {useSelector, useDispatch} from 'react-redux';

import completedImg from 'images/completed.svg';
import StartTrialModal from 'components/start_trial_modal';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {GlobalState} from 'mattermost-redux/types/store';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';

const CompletedWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px 8px;
    margin: auto;
    text-align: center;
    word-break: break-word;
    width: 100%;
    height: 100%;

    &.fade-enter {
        transform: scale(0);
    }
    &.fade-enter-active {
        transform: scale(1);
    }
    &.fade-enter-done {
        transform: scale(1);
    }
    &.fade-exit {
        transform: scale(1);
    }
    &.fade-exit-active {
        transform: scale(1);
    }
    &.fade-exit-done {
        transform: scale(1);
    }
    button {
        padding: 10px 20px;
        background: var(--button-bg);
        border-radius: 4px;
        color: var(--sidebar-text);
        border: none;
        font-weight: bold;
    }

    h2 {
        font-size: 20px;
        padding: 0 24px;
        margin: 0 0 10px;
    }

    p {
        font-size: 14px;
        color: rgba(var(--center-channel-color-rgb), 0.72);
        padding: 4px 24px;
    }
`;

interface Props {
    dismissAction: () => void;
}

const Completed = (props: Props): JSX.Element => {
    const {dismissAction} = props;

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPrevTrialLicense());
    }, []);

    const prevTrialLicense = useSelector((state: GlobalState) => state.entities.admin.prevTrialLicense);
    const license = useSelector(getLicense);
    const isPrevLicensed = prevTrialLicense?.IsLicensed;
    const isCurrentLicensed = license?.IsLicensed;

    // Show this CTA if the instance is currently not licensed and has never had a trial license loaded before
    const showStartTrialBtn = (isCurrentLicensed === 'false' && isPrevLicensed === 'false');

    const openStartTrialModalAndDismiss = () => {
        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'open_start_trial_modal',
        );
        dispatch(openModal({
            modalId: ModalIdentifiers.START_TRIAL_MODAL,
            dialogType: StartTrialModal,
        }));

        props.dismissAction();
    };

    return (
        <>
            <CSSTransition
                in={true}
                timeout={150}
                classNames='fade'
            >
                <CompletedWrapper>
                    <img
                        src={completedImg}
                        alt={'completed tasks image'}
                    />
                    <h2>
                        <FormattedMessage
                            id={'onboardingTask.checklist.completed_title'}
                            defaultMessage='Well done. You’ve completed all of the tasks!'
                        />
                    </h2>
                    <p>
                        <FormattedMessage
                            id={'onboardingTask.checklist.completed_subtitle'}
                            defaultMessage='We hope Mattermost is more familiar now. Need more help? '
                        />
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href={'https://docs.mattermost.com/'}
                        >
                            <FormattedMessage
                                id='onboardingTask.checklist.documentation_link'
                                defaultMessage='See our documentation.'
                            />
                        </a>
                    </p>

                    {showStartTrialBtn ? (
                        <>
                            <p>
                                <FormattedMessage
                                    id='onboardingTask.checklist.higher_security_features'
                                    defaultMessage='Interested in our higher-security features?'
                                /> <br/>
                                <FormattedMessage
                                    id='onboardingTask.checklist.start_enterprise_now'
                                    defaultMessage='Start your free Enterprise trial now!'
                                />
                            </p>
                            <button onClick={openStartTrialModalAndDismiss}>
                                <FormattedMessage
                                    id='start_trial.modal_btn.start'
                                    defaultMessage='Start free 30-day trial'
                                />
                            </button>
                        </>

                    ) : (
                        <button onClick={dismissAction}>
                            <FormattedMessage
                                id={'collapsed_reply_threads_modal.confirm'}
                                defaultMessage='Got it'
                            />
                        </button>
                    )}
                </CompletedWrapper>
            </CSSTransition>
        </>
    );
};

export default Completed;
