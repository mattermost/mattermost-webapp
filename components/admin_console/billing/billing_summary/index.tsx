// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {openModal} from 'actions/views/modals';
import {trackEvent} from 'actions/telemetry_actions';

import PurchaseModal from 'components/purchase_modal';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {ModalIdentifiers} from 'utils/constants';

import {
    noBillingHistory,
    upgradeFreeTierMattermostCloud,
    lastInvoiceInfo,
    freeTrial,
} from './billing_summary';

import './billing_summary.scss';

type BillingSummaryProps = {
    isPaidTier: boolean;
    isFreeTrial: boolean;
    daysLeftOnTrial: number;
}

const BillingSummary: React.FC<BillingSummaryProps> = ({isPaidTier, isFreeTrial, daysLeftOnTrial}: BillingSummaryProps) => {
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const dispatch = useDispatch<DispatchFunc>();
    const product = useSelector((state: GlobalState) => {
        if (state.entities.cloud.products && subscription) {
            return state.entities.cloud.products[subscription?.product_id];
        }
        return undefined;
    });

    // show the upgrade section when is a free tier customer
    const onUpgradeMattermostCloud = () => {
        trackEvent('cloud_admin', 'click_upgrade_mattermost_cloud');
        dispatch(openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        }));
    };

    let body = noBillingHistory;

    if (isFreeTrial) {
        body = freeTrial(onUpgradeMattermostCloud, daysLeftOnTrial);
    } else if (!isPaidTier) {
        body = upgradeFreeTierMattermostCloud(onUpgradeMattermostCloud);
    } else if (subscription?.last_invoice) {
        const invoice = subscription!.last_invoice;
        const fullCharges = invoice.line_items.filter((item) => item.type === 'full');
        const partialCharges = invoice.line_items.filter((item) => item.type === 'partial');
        body = (
            lastInvoiceInfo(invoice, product, fullCharges, partialCharges)
        );
    }

    return (
        <div className='BillingSummary'>
            {body}
        </div>
    );
};

export default BillingSummary;
