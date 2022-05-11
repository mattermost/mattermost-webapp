// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {CloudProducts, ModalIdentifiers} from 'utils/constants';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'types/store';

import {openModal} from 'actions/views/modals';
import PreTrialPricingModal from 'components/pre_trial_pricing_modal.tsx';

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

    const isAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const product = useSelector((state: GlobalState) => {
        if (state.entities.cloud.products && subscription) {
            return state.entities.cloud.products[subscription?.product_id];
        }
        return undefined;
    });

    const isEnterpriseTrial = product?.sku === CloudProducts.ENTERPRISE; // add check to ensure enterprise is a trial
    const isStarter = product?.sku === CloudProducts.STARTER;

    if (!isAdmin || isStarter || isEnterpriseTrial) {
        return null;
    }

    const openPreTrialPricingModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.PRE_TRIAL_PRICING_MODAL,
            dialogType: PreTrialPricingModal,
        }));
    };

    return (
        <UpgradeButton
            id='UpgradeButton'
            onClick={openPreTrialPricingModal}
        >
            {formatMessage({id: 'pretrial_pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'})}
        </UpgradeButton>
    );
};

export default UpgradeCloudButton;
