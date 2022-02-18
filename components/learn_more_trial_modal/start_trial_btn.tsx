// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';

import {useIntl} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {getLicenseConfig} from 'mattermost-redux/actions/general';

import {GlobalState} from 'types/store';

import {requestTrialLicense} from 'actions/admin_actions';
import {trackEvent} from 'actions/telemetry_actions';

import {closeModal} from 'actions/views/modals';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';

import './start_trial_btn.scss';

export type StartTrialBtnProps = {
    message: string;
    onClick?: () => void;
}

enum TrialLoadStatus {
    NotStarted = 'NOT_STARTED',
    Started = 'STARTED',
    Success = 'SUCCESS',
    Failed = 'FAILED'
}

const StartTrialBtn = ({
    message,
    onClick,
}: StartTrialBtnProps) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();
    const stats = useSelector((state: GlobalState) => state.entities.admin.analytics);

    const [status, setLoadStatus] = useState(TrialLoadStatus.NotStarted);

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
        await dispatch(closeModal(ModalIdentifiers.LEARN_MORE_TRIAL_MODAL));
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
            return message;
        }
    };
    const startTrial = useCallback(async () => {
        await requestLicense();
        onClick!();
        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'start_trial_from_',
        );
    }, [onClick]);

    return (
        <a
            className='StartTrialBtn start-trial-btn'
            onClick={startTrial}
        >
            {btnText(status)}
        </a>
    );
};

export default StartTrialBtn;
