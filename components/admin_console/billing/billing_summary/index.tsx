// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {GlobalState} from 'types/store';

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
    onUpgradeMattermostCloud: () => void;
}

const BillingSummary: React.FC<BillingSummaryProps> = ({isPaidTier, isFreeTrial, daysLeftOnTrial, onUpgradeMattermostCloud}: BillingSummaryProps) => {
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const product = useSelector((state: GlobalState) => {
        if (state.entities.cloud.products && subscription) {
            return state.entities.cloud.products[subscription?.product_id];
        }
        return undefined;
    });

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
