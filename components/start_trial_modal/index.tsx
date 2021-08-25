// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Modal, Button} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';
import {useHistory} from 'react-router-dom';

import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'mattermost-redux/types/store';
import {ModalIdentifiers} from 'utils/constants';
import {closeModal} from 'actions/views/modals';
import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {requestTrialLicense} from 'actions/admin_actions';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import StartTrialModalSvg from './start_trial_modal_svg';

import './start_trial_modal.scss';

enum TrialLoadStatus {
    NotStarted = 'NOT_STARTED',
    Started = 'STARTED',
    Success = 'SUCCESS',
    Failed = 'FAILED'
}

function StartTrialModal(): JSX.Element {
    const [status, setLoadStatus] = useState(TrialLoadStatus.NotStarted);
    const {formatMessage} = useIntl();
    const history = useHistory();
    const dispatch = useDispatch<DispatchFunc>();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.START_TRIAL_MODAL));
    const stats = useSelector((state: GlobalState) => state.entities.admin.analytics);

    const requestLicense = async () => {
        setLoadStatus(TrialLoadStatus.Started);
        let users = 0;
        if (stats && (typeof stats.TOTAL_USERS === 'number')) {
            users = stats.TOTAL_USERS;
        }
        const requestedUsers = Math.max(users, 30);
        const {error} = await dispatch(requestTrialLicense(requestedUsers, true, true, 'license'));
        if (error) {
            setLoadStatus(TrialLoadStatus.Failed);
        }

        setLoadStatus(TrialLoadStatus.Success);
        await dispatch(getLicenseConfig());
        dispatch(closeModal(ModalIdentifiers.START_TRIAL_MODAL));
        history.push('/admin_console/about/license');
    };

    const btnText = (status: TrialLoadStatus): string => {
        switch (status) {
        case TrialLoadStatus.Started:
            return formatMessage({id: 'start_trial.modal.loading', defaultMessage: 'Loading...'});
        case TrialLoadStatus.Success:
            return formatMessage({id: 'start_trial.modal.loaded', defaultMessage: 'Loaded!'});
        case TrialLoadStatus.Failed:
            return formatMessage({id: 'start_trial.modal.failed', defaultMessage: 'Failed'});
        default:
            return formatMessage({id: 'start_trial.modal_btn.start', defaultMessage: 'Start 30-day trial'});
        }
    };

    return (
        <>
            {show && (
                <Modal
                    className={'StartTrialModal'}
                    show={show}
                    id='startTrialModal'
                    role='dialog'
                    onHide={() => dispatch(closeModal(ModalIdentifiers.START_TRIAL_MODAL))}
                >
                    <Modal.Header closeButton={true}/>
                    <Modal.Body>
                        <StartTrialModalSvg/>
                        <div className='title'>
                            <FormattedMessage
                                id='start_trial.modal_title'
                                defaultMessage='Start your free Enterprise trial now'
                            />
                        </div>
                        <div className='description'>
                            <FormattedMessage
                                id='start_trial.modal_body'
                                defaultMessage='Start Enterprise for free to try advanced security and compliance features with premium support.'
                            />
                        </div>
                        <div className='buttons'>
                            <Button
                                className='dismiss-btn'
                                onClick={() => dispatch(closeModal(ModalIdentifiers.START_TRIAL_MODAL))}
                            >
                                <FormattedMessage
                                    id='start_trial.modal_btn.nottnow'
                                    defaultMessage='Not now'
                                />
                            </Button>
                            <Button
                                className='confirm-btn'
                                onClick={requestLicense}
                            >
                                {btnText(status)}
                            </Button>
                        </div>
                        <div className='disclaimer'>
                            <span>
                                <FormattedMessage
                                    id='start_trial.modal.disclaimer_1'
                                    defaultMessage='By clicking “Yes, start now”, I agree to the '
                                />
                            </span>
                            <span>
                                <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <FormattedMessage
                                        id='start_trial.modal.disclaimer_2'
                                        defaultMessage='Mattermost Software Evaluation Agreement, Privacy Policy, '
                                    />
                                </a>
                            </span>
                            <span>
                                <FormattedMessage
                                    id='start_trial.modal.disclaimer_3'
                                    defaultMessage='and receiving product emails.'
                                />

                            </span>
                        </div>
                    </Modal.Body>
                </Modal>

            )}
        </>
    );
}

export default StartTrialModal;
