// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {getCloudSubscription as selectCloudSubscription} from 'mattermost-redux/selectors/entities/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import GenericModal from 'components/generic_modal';
import PricingModal from 'components/pricing_modal';

import {closeModal, openModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';
import {ModalIdentifiers} from 'utils/constants';

import './create_team_restricted_modal.scss';

const CreateTeamRestrictedModal = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();

    const subscription = useSelector(selectCloudSubscription);
    const isSystemAdmin = useSelector(isCurrentUserSystemAdmin);
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.CREATE_TEAM_RESTRICTED_MODAL));

    if (!show) {
        return null;
    }

    const hadPrevCloudTrial = subscription?.is_free_trial === 'false' && subscription?.trial_end_at > 0;
    const showStartTrial = isSystemAdmin && !hadPrevCloudTrial;

    const dismissAction = async () => {
        await dispatch(closeModal(ModalIdentifiers.CREATE_TEAM_RESTRICTED_MODAL));
    };

    const openPricingModal = async () => {
        await dismissAction();

        await dispatch(openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
        }));
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
                        <FormattedMarkdownMessage
                            id='create_team_restricted_modal.agreement'
                            defaultMessage='By selecting **Try free for 30 days**, I agree to the [Mattermost Software Evaluation Agreement](!https://mattermost.com/software-evaluation-agreement/), [Privacy Policy](!https://mattermost.com/privacy-policy/), and receiving product emails.'
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
