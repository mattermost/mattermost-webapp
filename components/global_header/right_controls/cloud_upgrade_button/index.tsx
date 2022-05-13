// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {CloudProducts, ModalIdentifiers} from 'utils/constants';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'types/store';
import {trackEvent} from 'actions/telemetry_actions';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getRemainingDaysFromFutureTimestamp} from 'utils/utils';

import {openModal} from 'actions/views/modals';
import PricingModal from 'components/pricing_modal';

const UpgradeButton = styled.button`
background: #1C58D9;
border-radius: 4px;
border: none;
box-shadow: none;
height: 24px;
width: 67px;
font-family: 'Open Sans';
font-style: normal;
font-weight: 600;
font-size: 11px;
line-height: 10px;
letter-spacing: 0.02em;
color: #FFFFFF;
`;

const UpgradeCloudButton = (): JSX.Element | null => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();

    const openPricingModal = () => {
        trackEvent('cloud_admin', 'click_open_pricing_modal');
        dispatch(openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
        }));
    };

    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const isAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const product = useSelector((state: GlobalState) => {
        if (state.entities.cloud.products && subscription) {
            return state.entities.cloud.products[subscription?.product_id];
        }
        return undefined;
    });

    const license = useSelector(getLicense);
    const isCloud = license?.Cloud === 'true';

    const isEnterprise = product?.sku === CloudProducts.ENTERPRISE;
    let isEnterpriseTrial = false;
    const daysLeftOnTrial = getRemainingDaysFromFutureTimestamp(subscription?.trial_end_at);
    if (isEnterprise && daysLeftOnTrial > 0) {
        isEnterpriseTrial = true;
    }

    const isStarter = product?.sku === CloudProducts.STARTER;

    if (!isCloudFreeEnabled) {
        return null;
    }

    if (!isCloud || !isAdmin) {
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
