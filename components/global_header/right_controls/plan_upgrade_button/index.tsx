// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {CloudProducts} from 'utils/constants';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getCloudProducts, getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {getCloudSubscription as selectCloudSubscription, getSubscriptionProduct as selectSubscriptionProduct, isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

const UpgradeButton = styled.button`
background: var(--denim-button-bg);
border-radius: 4px;
border: none;
box-shadow: none;
height: 24px;
width: 67px;
font-family: 'Open Sans';
font-style: normal;
font-weight: 600;
font-size: 11px !important;
line-height: 10px;
letter-spacing: 0.02em;
color: var(--button-color);
`;

let openPricingModal: () => void;

const PlanUpgradeButton = (): JSX.Element | null => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();

    openPricingModal = useOpenPricingModal();
    const isCloud = useSelector(isCurrentLicenseCloud);

    useEffect(() => {
        if (isCloud) {
            dispatch(getCloudSubscription());
            dispatch(getCloudProducts());
        }
    }, [isCloud]);

    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const subscription = useSelector(selectCloudSubscription);
    const product = useSelector(selectSubscriptionProduct);
    const config = useSelector(getConfig);
    const license = useSelector(getLicense);

    const enableForSelfHosted = config?.EnableUpgradeForSelfHostedStarter === 'true';

    const isEnterpriseTrial = subscription?.is_free_trial === 'true';
    const isStarter = product?.sku === CloudProducts.STARTER;

    const isSelfHostedEnterpriseTrial = !isCloud && license.IsTrial === 'true';
    const isSelfHostedStarter = license.IsLicensed === 'false';

    if (!isAdmin) {
        return null;
    }

    // for cloud, only show when subscribed to starter or enterprise trial plans
    if (isCloud && !(isStarter || isEnterpriseTrial)) {
        return null;
    }

    // for non cloud, only show when subscribed to self hosted starter or self hosted enterprise trial plans
    if (!isCloud && !(isSelfHostedStarter || isSelfHostedEnterpriseTrial)) {
        return null;
    }

    // for non cloud, when on starter, check if button is configured to show
    if (!isCloud && isSelfHostedStarter && !enableForSelfHosted) {
        return null;
    }

    return (
        <UpgradeButton
            id='UpgradeButton'
            onClick={openPricingModal}
        >
            {formatMessage({id: 'pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'})}
        </UpgradeButton>);
};

export default PlanUpgradeButton;
export {openPricingModal};
