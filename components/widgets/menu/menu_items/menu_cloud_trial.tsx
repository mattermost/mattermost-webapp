// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import UpgradeLink from 'components/widgets/links/upgrade_link';
import TrialBenefitsModal from 'components/trial_benefits_modal/trial_benefits_modal';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {openModal} from 'actions/views/modals';

import {getRemainingDaysFromFutureTimestamp} from 'utils/utils';
import {TrialPeriodDays, ModalIdentifiers} from 'utils/constants';

import './menu_item.scss';
import CloudStartTrialBtn from 'components/cloud_start_trial/cloud_start_trial_btn';

type Props = {
    id: string;
}
const MenuCloudTrial = ({id}: Props) => {
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const license = useSelector(getLicense);
    const dispatch = useDispatch<DispatchFunc>();
    const {formatMessage} = useIntl();

    const isCloud = license?.Cloud === 'true';
    const isFreeTrial = false && subscription?.is_free_trial === 'true';
    const isCloudFreeEnabled = true; //useSelector(cloudFreeEnabled);

    // TODO fremmium check the limits to show the limit warning during the trial
    // warning instead of the cta *** la cloud subscription tiene el trial end at, create a function to calculate that trial ended

    // TODO fremium check if there was already a cloud trial and show the plans modal when is under 50% limit

    let daysLeftOnTrial = getRemainingDaysFromFutureTimestamp(subscription?.trial_end_at);
    if (daysLeftOnTrial > TrialPeriodDays.TRIAL_MAX_DAYS) {
        daysLeftOnTrial = TrialPeriodDays.TRIAL_MAX_DAYS;
    }

    const nonCloudFreeButIsFreeTrial = !isCloudFreeEnabled && isFreeTrial;

    const openTrialBenefitsModal = async () => {
        await dispatch(openModal({
            modalId: ModalIdentifiers.TRIAL_BENEFITS_MODAL,
            dialogType: TrialBenefitsModal,
        }));
    };

    const show = isCloud && (nonCloudFreeButIsFreeTrial || isCloudFreeEnabled);
    if (!show) {
        return null;
    }

    const nonCloudFreeTrialContent = (
        <>
            <FormattedMessage
                id='menu.nonCloudFree.daysLeftOnTrial'
                defaultMessage='There are {daysLeftOnTrial} days left on your Cloud trial.'
                values={{daysLeftOnTrial}}
            />
            <UpgradeLink
                buttonText={formatMessage({id: 'menu.nonCloudFree.subscribeNow', defaultMessage: 'Subscribe Now'})}
                styleLink={true}
            />
        </>
    );

    const cloudFreeContent = isFreeTrial ? (
        <>
            <FormattedMessage
                id='menu.cloudFree.tryEnterprise'
                defaultMessage='Are you making the most of your Enterprise trial? '
            />
            <a
                className='open-trial-benefits-modal style-link'
                onClick={openTrialBenefitsModal}
            >
                <FormattedMessage
                    id='menu.cloudFree.reviewEnterpriseFeatures'
                    defaultMessage='Review our Enterprise Features'
                />
            </a>
        </>
    ) : (
        <>
            <FormattedMessage
                id='menu.cloudFree.tryEnterprise'
                defaultMessage='Interested in a limitless plan with high-security features?'
            />
            <CloudStartTrialBtn
                message={formatMessage({id: 'menu.cloudFree.tryEnterpriseFor30Days', defaultMessage: 'Try Enterprise free for 30 days'})}
                telemetryId={'start_cloud_trial_from_main_menu'}
            />
        </>
    );

    return (
        <li
            className={'MenuCloudTrial'}
            role='menuitem'
            id={id}
        >
            {isCloudFreeEnabled ? cloudFreeContent : nonCloudFreeTrialContent}
        </li>
    );
};
export default MenuCloudTrial;