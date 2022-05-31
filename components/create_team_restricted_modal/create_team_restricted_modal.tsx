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

import './create_team_restricted_modal.scss';

const CreateTeamRestrictedModal = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();

    const subscription = useSelector(selectCloudSubscription);
    const isSystemAdmin = useSelector(isCurrentUserSystemAdmin);
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.CREATE_TEAM_RESTRICTED_MODAL));
    const openPricingModal = useOpenPricingModal();

    if (!show) {
        return null;
    }

    const hadPrevCloudTrial = subscription?.is_free_trial === 'false' && subscription?.trial_end_at > 0;
    const showStartTrial = isSystemAdmin && !hadPrevCloudTrial;

    const dismissAction = async () => {
        await dispatch(closeModal(ModalIdentifiers.CREATE_TEAM_RESTRICTED_MODAL));
    };

    return (
        <GenericModal
            id='CreateTeamRestrictedModal'
            className='CreateTeamRestrictedModal'
            useCompassDesign={true}
            modalHeaderText={hadPrevCloudTrial ? (
                formatMessage({id: 'create_team_restricted_modal.title.prevTrial', defaultMessage: 'Upgrade to create unlimited teams'})
            ) : (
                formatMessage({id: 'create_team_restricted_modal.title', defaultMessage: 'Try unlimited teams with a free trial'})
            )}
            onExited={dismissAction}
        >
            <div className='CreateTeamRestrictedModal__body'>
                <p className='CreateTeamRestrictedModal__description'>
                    {hadPrevCloudTrial ? (
                        formatMessage({
                            id: 'create_team_restricted_modal.description.prevTrial',
                            defaultMessage: 'Multiple teams allow for context-specific spaces that are more attuned to your and your teams’ needs. Upgrade to the Professional plan to create unlimited teams.',
                        })
                    ) : (
                        formatMessage({
                            id: 'create_team_restricted_modal.description',
                            defaultMessage: 'Create unlimited teams with one of our paid plans. Get the full experience of Enterprise when you start a free, 30 day trial.',
                        })
                    )}
                </p>
                {!hadPrevCloudTrial && (
                    <p className='CreateTeamRestrictedModal__terms'>
                        <FormattedMessage
                            id='create_team_restricted_modal.agreement'
                            defaultMessage='By selecting <highlight>Try free for 30 days</highlight>, I agree to the <linkEvaluation>Mattermost Software Evaluation Agreement</linkEvaluation>, <linkPrivacy>Privacy Policy</linkPrivacy>, and receiving product emails.'
                            values={{
                                highlight: (msg: React.ReactNode) => (
                                    <strong>
                                        {msg}
                                    </strong>
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
                <div className={classNames('CreateTeamRestrictedModal__buttons', {single: !showStartTrial})}>
                    <button
                        className='button-plans'
                        onClick={openPricingModal}
                    >
                        {formatMessage({id: 'create_team_restricted_modal.button.plans', defaultMessage: 'View plans'})}
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

export default CreateTeamRestrictedModal;
