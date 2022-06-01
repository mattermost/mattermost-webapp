// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import UpgradeLink from 'components/widgets/links/upgrade_link';
import TrialBenefitsModal from 'components/trial_benefits_modal/trial_benefits_modal';
import LearnMoreTrialModal from 'components/learn_more_trial_modal/learn_more_trial_modal';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {openModal} from 'actions/views/modals';

import {getRemainingDaysFromFutureTimestamp} from 'utils/utils';
import {TrialPeriodDays, ModalIdentifiers, CloudProducts} from 'utils/constants';
import useGetHighestThresholdCloudLimit from 'components/common/hooks/useGetHighestThresholdCloudLimit';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import {getCloudSubscription, getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';

import './menu_item.scss';

type Props = {
    id: string;
}
const MenuCloudTrial = ({id}: Props) => {
    const subscription = useSelector(getCloudSubscription);
    const subscriptionProduct = useSelector(getSubscriptionProduct);
    const license = useSelector(getLicense);
    const dispatch = useDispatch<DispatchFunc>();
    const {formatMessage} = useIntl();

    const isCloud = license?.Cloud === 'true';
    const isFreeTrial = subscription?.is_free_trial === 'true';
    const noPriorTrial = !(subscription?.is_free_trial === 'false' && subscription?.trial_end_at > 0);
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const openPricingModal = useOpenPricingModal();

    let daysLeftOnTrial = getRemainingDaysFromFutureTimestamp(subscription?.trial_end_at);
    const maxDays = isCloudFreeEnabled ? TrialPeriodDays.TRIAL_30_DAYS : TrialPeriodDays.TRIAL_14_DAYS;
    if (daysLeftOnTrial > maxDays) {
        daysLeftOnTrial = maxDays;
    }

    const openTrialBenefitsModal = async () => {
        await dispatch(openModal({
            modalId: ModalIdentifiers.TRIAL_BENEFITS_MODAL,
            dialogType: TrialBenefitsModal,
        }));
    };

    const openLearnMoreTrialModal = async () => {
        await dispatch(openModal({
            modalId: ModalIdentifiers.TRIAL_BENEFITS_MODAL,
            dialogType: LearnMoreTrialModal,
        }));
    };

    const someLimitNeedsAttention = Boolean(useGetHighestThresholdCloudLimit(useGetUsage(), useGetLimits()[0]));

    const isStarter = subscriptionProduct?.sku === CloudProducts.STARTER;

    if (!isCloud) {
        return null;
    }

    // TODO: Remove once cloud free launches
    if (!isCloudFreeEnabled && isFreeTrial) {
        return (
            <li
                className={'MenuCloudTrial'}
                role='menuitem'
                id={id}
            >
                <FormattedMessage
                    id='menu.nonCloudFree.daysLeftOnTrial'
                    defaultMessage='There are {daysLeftOnTrial} days left on your Cloud trial.'
                    values={{daysLeftOnTrial}}
                />
                <UpgradeLink
                    buttonText={formatMessage({id: 'menu.nonCloudFree.subscribeNow', defaultMessage: 'Subscribe Now'})}
                    styleLink={true}
                />
            </li>
        );
    }

    if (!isCloudFreeEnabled || someLimitNeedsAttention || (!isStarter && !isFreeTrial)) {
        return null;
    }

    const freeTrialContent = (
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
    );

    // menu option displayed when the workspace is not running any trial
    const noFreeTrialContent = noPriorTrial ? (
        <>
            <FormattedMessage
                id='menu.cloudFree.tryEnterprise'
                defaultMessage='Interested in a limitless plan with high-security features?'
            />
            <a
                className='open-learn-more-trial-modal style-link'
                onClick={openLearnMoreTrialModal}
            >
                <FormattedMessage
                    id='menu.cloudFree.tryEnterpriseFor30Days'
                    defaultMessage='Try Enterprise free for 30 days'
                />
            </a>
        </>
    ) : (
        <>
            <FormattedMessage
                id='menu.cloudFree.tryEnterprise'
                defaultMessage='Interested in a limitless plan with high-security features?'
            />
            <a
                className='open-see-plans-modal style-link'
                onClick={openPricingModal}
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
