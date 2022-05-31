// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {CloudProducts} from 'utils/constants';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCloudProducts, getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {getCloudSubscription as selectCloudSubscription, getSubscriptionProduct as selectSubscriptionProduct, isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';

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
color: var(--sidebar-text);
`;

let openPricingModal: () => void;

const UpgradeCloudButton = (): JSX.Element | null => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();

    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const subscription = useSelector(selectCloudSubscription);
    const product = useSelector(selectSubscriptionProduct);
    const isCloud = useSelector(isCurrentLicenseCloud);

    useEffect(() => {
        if (isCloud) {
            dispatch(getCloudSubscription());
            dispatch(getCloudProducts());
        }
    }, [isCloud]);

    openPricingModal = useOpenPricingModal();

    const isEnterpriseTrial = subscription?.is_free_trial === 'true';
    const isStarter = product?.sku === CloudProducts.STARTER;

    if (!isCloud || !isAdmin || !isCloudFreeEnabled) {
        return null;
    }

    let btn = null;
    if (isStarter || isEnterpriseTrial) {
        btn = (
            <UpgradeButton
                id='UpgradeButton'
                onClick={openPricingModal}
            >
                {formatMessage({id: 'pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'})}
            </UpgradeButton>);
    }

    return btn;
};

export default UpgradeCloudButton;
export {openPricingModal};
