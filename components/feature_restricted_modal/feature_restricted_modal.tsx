// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useIntl, FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {getCloudSubscription as selectCloudSubscription} from 'mattermost-redux/selectors/entities/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';
import GenericModal from 'components/generic_modal';

import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';
import {ModalIdentifiers, AboutLinks, LicenseLinks} from 'utils/constants';

import './feature_restricted_modal.scss';

type FeatureRestrictedModalProps = {
    modalTitle: string;
    modalMessage: string;
    modalTitleAfterTrial: string;
    modalMessageAfterTrial: string;
}

const FeatureRestrictedModal = ({
    modalTitle,
    modalMessage,
    modalTitleAfterTrial,
    modalMessageAfterTrial,
}: FeatureRestrictedModalProps) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();

    const subscription = useSelector(selectCloudSubscription);
    const isSystemAdmin = useSelector(isCurrentUserSystemAdmin);
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.FEATURE_RESTRICTED_MODAL));
    const openPricingModal = useOpenPricingModal();

    if (!show) {
        return null;
    }

    const dismissAction = () => {
        dispatch(closeModal(ModalIdentifiers.FEATURE_RESTRICTED_MODAL));
    };

    const handleViewPlansClick = () => {
        openPricingModal();
        dismissAction();
    };

    const hadPrevCloudTrial = subscription?.is_free_trial === 'false' && subscription?.trial_end_at > 0;
    const showStartTrial = isSystemAdmin && !hadPrevCloudTrial;

    return (
        <GenericModal
            id='FeatureRestrictedModal'
            className='FeatureRestrictedModal'
            useCompassDesign={true}
            modalHeaderText={hadPrevCloudTrial ? modalTitleAfterTrial : modalTitle}
            onExited={dismissAction}
        >
            <div className='FeatureRestrictedModal__body'>
                <p className='FeatureRestrictedModal__description'>
                    {hadPrevCloudTrial ? modalMessageAfterTrial : modalMessage}
                </p>
                {showStartTrial && (
                    <p className='FeatureRestrictedModal__terms'>
                        <FormattedMessage
                            id='feature_restricted_modal.agreement'
                            defaultMessage='By selecting <highlight>Try free for 30 days</highlight>, I agree to the <linkEvaluation>Mattermost Software Evaluation Agreement</linkEvaluation>, <linkPrivacy>Privacy Policy</linkPrivacy>, and receiving product emails.'
                            values={{
                                highlight: (msg: React.ReactNode) => (
                                    <strong>{msg}</strong>
                                ),
                                linkEvaluation: (msg: React.ReactNode) => (
                                    <a
                                        href={LicenseLinks.SOFTWARE_EVALUATION_AGREEMENT}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        {msg}
                                    </a>
                                ),
                                linkPrivacy: (msg: React.ReactNode) => (
                                    <a
                                        href={AboutLinks.PRIVACY_POLICY}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        {msg}
                                    </a>
                                ),
                            }}
                        />
                    </p>
                )}
                <div className={classNames('FeatureRestrictedModal__buttons', {single: !showStartTrial})}>
                    <button
                        className='button-plans'
                        onClick={handleViewPlansClick}
                    >
                        {formatMessage({id: 'feature_restricted_modal.button.plans', defaultMessage: 'View plans'})}
                    </button>
                    {showStartTrial && (
                        <CloudStartTrialButton
                            extraClass='button-trial'
                            message={formatMessage({id: 'menu.cloudFree.tryFreeFor30Days', defaultMessage: 'Try free for 30 days'})}
                            telemetryId={'start_cloud_trial_after_team_creation_restricted'}
                            onClick={dismissAction}
                        />
                    )}
                </div>
            </div>
        </GenericModal>
    );
};

export default FeatureRestrictedModal;
