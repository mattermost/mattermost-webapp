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
import {LicenseSkus} from 'mattermost-redux/types/general';

import {openModal} from 'actions/views/modals';

import {getRemainingDaysFromFutureTimestamp} from 'utils/utils';
import {TrialPeriodDays, ModalIdentifiers} from 'utils/constants';

import './menu_item.scss';
import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';

type Props = {
    id: string;
}
const MenuCloudTrial = ({id}: Props) => {
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const license = useSelector(getLicense);
    const dispatch = useDispatch<DispatchFunc>();
    const {formatMessage} = useIntl();

    const isCloud = license?.Cloud === 'true';
    const isFreeTrial = subscription?.is_free_trial === 'true';
    const hadPrevCloudTrial = subscription?.is_free_trial === 'false' && subscription?.trial_end_at > 0;
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const isCloudFreePaidSubscription = isCloud && isCloudFreeEnabled && license?.SkuShortName !== LicenseSkus.Starter && !isFreeTrial;
    const isCloudPaidSubscription = isCloud && Boolean(subscription?.is_paid_tier === 'true');

    let daysLeftOnTrial = getRemainingDaysFromFutureTimestamp(subscription?.trial_end_at);
    if (daysLeftOnTrial > TrialPeriodDays.TRIAL_MAX_DAYS) {
        daysLeftOnTrial = TrialPeriodDays.TRIAL_MAX_DAYS;
    }

    const openTrialBenefitsModal = async () => {
        await dispatch(openModal({
            modalId: ModalIdentifiers.TRIAL_BENEFITS_MODAL,
            dialogType: TrialBenefitsModal,
        }));
    };

    const show = isCloud && !isCloudFreePaidSubscription && !isCloudPaidSubscription;
    if (!show) {
        return null;
    }

    // this is the menu content displayed when the workspace is running a trial. It would display a different option depending if
    // cloudFree is enabled or not.
    const freeTrialContent = isCloudFreeEnabled ? (
        <>
            <FormattedMessage
                id='menu.cloudFree.reviewEnterpriseFeaturesTitle'
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

    // menu option displayed when the workspace is not running any trial
    const noFreeTrialContent = (isCloudFreeEnabled && !hadPrevCloudTrial) ? (
        <>
            <FormattedMessage
                id='menu.cloudFree.tryEnterprise'
                defaultMessage='Interested in a limitless plan with high-security features?'
            />
            <CloudStartTrialButton
                message={formatMessage({id: 'menu.cloudFree.tryEnterpriseFor30Days', defaultMessage: 'Try Enterprise free for 30 days'})}
                telemetryId={'start_cloud_trial_from_main_menu'}
                extraClass={'style-link'}
            />
        </>
    ) : (
        <>
            <FormattedMessage
                id='menu.cloudFree.tryEnterprise'
                defaultMessage='Interested in a limitless plan with high-security features?'
            />

            {/* Todo: modify this to open the see plans modal */}
            <a
                className='open-see-plans-modal style-link'
                onClick={() => null}
            >
                <FormattedMessage
                    id='menu.cloudFree.seePlans'
                    defaultMessage='See plans'
                />
            </a>
        </>
    );

    return (
        <li
            className={'MenuCloudTrial'}
            role='menuitem'
            id={id}
        >
            {isFreeTrial ? freeTrialContent : noFreeTrialContent}
        </li>
    );
};
export default MenuCloudTrial;
