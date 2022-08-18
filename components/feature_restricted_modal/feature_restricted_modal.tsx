// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useIntl, FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {checkHadPriorTrial} from 'mattermost-redux/selectors/entities/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';
import GenericModal from 'components/generic_modal';
import {useNotifyAdmin} from 'components/notify_admin_cta/notify_admin_cta';

import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';
import {FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS} from 'utils/cloud_utils';
import {ModalIdentifiers, AboutLinks, LicenseLinks} from 'utils/constants';

import './feature_restricted_modal.scss';

type FeatureRestrictedModalProps = {
    titleAdminPreTrial: string;
    messageAdminPreTrial: string;
    titleAdminPostTrial: string;
    messageAdminPostTrial: string;
    titleEndUser?: string;
    messageEndUser?: string;
    customSecondaryButton?: {msg: string; action: () => void};
    feature?: string;
    minimumPlanRequiredForFeature?: string;
}

const FeatureRestrictedModal = ({
    titleAdminPreTrial,
    messageAdminPreTrial,
    titleAdminPostTrial,
    messageAdminPostTrial,
    titleEndUser,
    messageEndUser,
    customSecondaryButton,
    feature,
    minimumPlanRequiredForFeature,
}: FeatureRestrictedModalProps) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();

    const hasPriorTrial = useSelector(checkHadPriorTrial);
    const isSystemAdmin = useSelector(isCurrentUserSystemAdmin);
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.FEATURE_RESTRICTED_MODAL));
    const openPricingModal = useOpenPricingModal();

    const [notifyAdminStatus, notifyAdmin] = useNotifyAdmin({
        ctaText: formatMessage({
            id: 'feature_restricted_modal.button.notify',
            defaultMessage: 'Notify Admin',
        }),
    }, {
        required_feature: feature || '',
        required_plan: minimumPlanRequiredForFeature || '',
        trial_notification: false,
    });

    if (!show) {
        return null;
    }

    const dismissAction = () => {
        dispatch(closeModal(ModalIdentifiers.FEATURE_RESTRICTED_MODAL));
    };

    const handleViewPlansClick = (e) => {
        if (isSystemAdmin) {
            openPricingModal({trackingLocation: 'feature_restricted_modal'});
            dismissAction();
        } else {
            notifyAdmin(e, 'feature_restricted_modal');
        }
    };

    const getTitle = () => {
        if (isSystemAdmin) {
            return hasPriorTrial ? titleAdminPostTrial : titleAdminPreTrial;
        }

        return titleEndUser;
    };

    const getMessage = () => {
        if (isSystemAdmin) {
            return hasPriorTrial ? messageAdminPostTrial : messageAdminPreTrial;
        }

        return messageEndUser;
    };

    const showStartTrial = isSystemAdmin && !hasPriorTrial;

    // define what is the secondary button text and action, by default will be the View Plan button
    let secondaryBtnMsg = formatMessage({id: 'feature_restricted_modal.button.plans', defaultMessage: 'View plans'});
    if (!isSystemAdmin) {
        secondaryBtnMsg = notifyAdminStatus as string;
    }
    let secondaryBtnAction = handleViewPlansClick;
    if (customSecondaryButton) {
        secondaryBtnMsg = customSecondaryButton.msg;
        secondaryBtnAction = customSecondaryButton.action;
    }

    return (
        <GenericModal
            id='FeatureRestrictedModal'
            className='FeatureRestrictedModal'
            compassDesign={true}
            modalHeaderText={getTitle()}
            onExited={dismissAction}
        >
            <div className='FeatureRestrictedModal__body'>
                <p className='FeatureRestrictedModal__description'>
                    {getMessage()}
                </p>
                {showStartTrial && (
                    <p className='FeatureRestrictedModal__terms'>
                        <FormattedMessage
                            id='feature_restricted_modal.agreement'
                            defaultMessage='By selecting <highlight>Try free for {trialLength} days</highlight>, I agree to the <linkEvaluation>Mattermost Software Evaluation Agreement</linkEvaluation>, <linkPrivacy>Privacy Policy</linkPrivacy>, and receiving product emails.'
                            values={{
                                trialLength: FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS,
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
                        onClick={secondaryBtnAction}
                    >
                        {secondaryBtnMsg}
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
