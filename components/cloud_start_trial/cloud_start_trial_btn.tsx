// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {getLicenseConfig} from 'mattermost-redux/actions/general';

import {requestCloudTrial, validateBusinessEmail} from 'actions/cloud';
import {trackEvent} from 'actions/telemetry_actions';
import {openModal, closeModal} from 'actions/views/modals';

import TrialBenefitsModal from 'components/trial_benefits_modal/trial_benefits_modal';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';

import RequestBusinessEmailModal from './request_business_email_modal';
import './cloud_start_trial_btn.scss';

export type CloudStartTrialBtnProps = {
    message: string;
    telemetryId: string;
    onClick?: () => void;
    extraClass?: string;
    afterTrialRequest?: () => void;
    emailAlreadyValidated?: boolean;
    disabled?: boolean;
};

enum TrialLoadStatus {
    NotStarted = 'NOT_STARTED',
    Started = 'STARTED',
    Success = 'SUCCESS',
    Failed = 'FAILED',
    Embargoed = 'EMBARGOED',
}

const CloudStartTrialButton = ({
    message,
    telemetryId,
    extraClass,
    onClick,
    afterTrialRequest,
    emailAlreadyValidated,
    disabled = false,
}: CloudStartTrialBtnProps) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();

    const [status, setLoadStatus] = useState(TrialLoadStatus.NotStarted);

    const requestStartTrial = async (): Promise<TrialLoadStatus> => {
        setLoadStatus(TrialLoadStatus.Started);

        // emailAlreadyValidated is a prop that is set ONLY from the instance of this component
        // created in the requestBusinessEmail modal. So the flow is the following: This button is clicked from
        // the learn more about trial modal, If the email of the admin and the
        // email of the CWS customer are not valid, the requestBusinessModal is shown and that component will
        // create this StartCloudTrialBtn passing the emailAlreadyValidated as TRUE, so the requetTrial flow continues normally
        if (!emailAlreadyValidated) {
            const isValidBusinessEmail = await validateBusinessEmail()();
            if (!isValidBusinessEmail) {
                await dispatch(closeModal(ModalIdentifiers.LEARN_MORE_TRIAL_MODAL));
                openRequestBusinessEmailModal();
                setLoadStatus(TrialLoadStatus.Failed);
                return TrialLoadStatus.Failed;
            }
        }

        const productUpdated = true; //await requestCloudTrial('start_trial_btn')();
        if (!productUpdated) {
            setLoadStatus(TrialLoadStatus.Failed);
            return TrialLoadStatus.Failed;
        }
        await dispatch(getLicenseConfig());
        if (afterTrialRequest) {
            afterTrialRequest();
        }
        setLoadStatus(TrialLoadStatus.Success);
        return TrialLoadStatus.Success;
    };

    const openTrialBenefitsModal = async (status: TrialLoadStatus) => {
        // Only open the benefits modal if the trial request succeeded
        if (status !== TrialLoadStatus.Success) {
            return;
        }
        await dispatch(openModal({
            modalId: ModalIdentifiers.TRIAL_BENEFITS_MODAL,
            dialogType: TrialBenefitsModal,
            dialogProps: {trialJustStarted: true},
        }));
    };

    const openRequestBusinessEmailModal = async () => {
        await dispatch(openModal({
            modalId: ModalIdentifiers.REQUEST_BUSINESS_EMAIL_MODAL,
            dialogType: RequestBusinessEmailModal,
        }));
    };

    const btnText = (status: TrialLoadStatus): string => {
        switch (status) {
        case TrialLoadStatus.Started:
            return formatMessage({id: 'start_cloud_trial.modal.gettingTrial', defaultMessage: 'Getting Trial...'});
        case TrialLoadStatus.Success:
            return formatMessage({id: 'start_cloud_trial.modal.loaded', defaultMessage: 'Loaded!'});
        case TrialLoadStatus.Failed:
            return formatMessage({id: 'start_cloud_trial.modal.failed', defaultMessage: 'Failed'});
        case TrialLoadStatus.Embargoed:
            return formatMessage({id: 'admin.license.trial-request.embargoed'});
        default:
            return message;
        }
    };
    const startCloudTrial = async () => {
        const updatedStatus = await requestStartTrial();

        await openTrialBenefitsModal(updatedStatus);
        if (onClick && updatedStatus === TrialLoadStatus.Success) {
            onClick();
        }
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_START_TRIAL_BUTTON,
            telemetryId,
        );
    };

    return (
        <button
            className={`CloudStartTrialButton ${extraClass}`}
            onClick={startCloudTrial}
            disabled={disabled}
        >
            {btnText(status)}
        </button>
    );
};

export default CloudStartTrialButton;
