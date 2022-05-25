// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {CloudProducts, ModalIdentifiers} from 'utils/constants';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'types/store';
import {trackEvent} from 'actions/telemetry_actions';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCloudProducts, getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {getCloudSubscription as selectCloudSubscription, getCloudProduct as selectCloudProduct, isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';

import {openModal} from 'actions/views/modals';
import PricingModal from 'components/pricing_modal';

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
color: var(--center-channel-bg);
`;

let openPricingModal: () => void;

const UpgradeCloudButton = (): JSX.Element | null => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();

    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const isAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));
    const subscription = useSelector(selectCloudSubscription);
    const product = useSelector(selectCloudProduct);
    const isCloud = useSelector(isCurrentLicenseCloud);

    useEffect(() => {
        if (isCloud) {
            dispatch(getCloudSubscription());
            dispatch(getCloudProducts());
        }
    }, []);

    openPricingModal = () => {
        trackEvent('cloud_admin', 'click_open_pricing_modal');
        dispatch(openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
        }));
    };

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
