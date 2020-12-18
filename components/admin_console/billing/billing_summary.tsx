// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import noBillingHistoryGraphic from 'images/no_billing_history_graphic.svg';

import './billing_summary.scss';

const noBillingHistory = (
    <div className='BillingSummary__noBillingHistory'>
        <img
            className='BillingSummary__noBillingHistory-graphic'
            src={noBillingHistoryGraphic}
        />
        <div className='BillingSummary__noBillingHistory-title'>
            <FormattedMessage
                id='admin.billing.subscriptions.billing_summary.noBillingHistory.title'
                defaultMessage='No billing history yet'
            />
        </div>
        <div className='BillingSummary__noBillingHistory-message'>
            <FormattedMessage
                id='admin.billing.subscriptions.billing_summary.noBillingHistory.description'
                defaultMessage='In the future, this is where your most recent bill summary will show.'
            />
        </div>
        <a
            target='_blank'
            rel='noopener noreferrer'
            href='http://www.google.com'
            className='BillingSummary__noBillingHistory-link'
        >
            <FormattedMessage
                id='admin.billing.subscriptions.billing_summary.noBillingHistory.link'
                defaultMessage='See how billing works'
            />
        </a>
    </div>
);

const BillingSummary: React.FC = () => {
    return (
        <div className='BillingSummary'>
            {noBillingHistory}
        </div>
    );
};

export default BillingSummary;
