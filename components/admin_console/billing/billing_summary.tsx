// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedDate, FormattedMessage, FormattedNumber} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';
import BlockableLink from 'components/admin_console/blockable_link';
import OverlayTrigger from 'components/overlay_trigger';
import {CloudLinks} from 'utils/constants';

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
            target='_new'
            rel='noopener noreferrer'
            href={CloudLinks.BILLING_DOCS}
            className='BillingSummary__noBillingHistory-link'
            onClick={() => trackEvent('cloud_admin', 'click_how_billing_works', {screen: 'subscriptions'})}
        >
            <FormattedMessage
                id='admin.billing.subscriptions.billing_summary.noBillingHistory.link'
                defaultMessage='See how billing works'
            />
        </a>
    </div>
);

const invoice = {
    date: new Date(2020, 5, 8),
};

const lastInvoiceSummary = (
    <div className='BillingSummary__lastInvoice'>
        <div className='BillingSummary__lastInvoice-header'>
            <div className='BillingSummary__lastInvoice-headerTitle'>
                <FormattedMessage
                    id='admin.billing.subscriptions.billing_summary.lastInvoice.title'
                    defaultMessage='Last Invoice'
                />
            </div>
            <div className='BillingSummary__lastInvoice-headerStatus'>
                {'Paid'}
                <i className='icon icon-check-circle-outline'/>
            </div>
        </div>
        <div className='BillingSummary__lastInvoice-date'>
            <FormattedDate
                value={invoice.date}
                month='short'
                year='numeric'
                day='numeric'
            />
        </div>
        <div className='BillingSummary__lastInvoice-productName'>
            {'Mattermost Cloud'}
        </div>
        <hr/>
        <div className='BillingSummary__lastInvoice-charge'>
            <div className='BillingSummary__lastInvoice-chargeDescription'>
                {'$10.00 x 30 users'}
            </div>
            <div className='BillingSummary__lastInvoice-chargeAmount'>
                <FormattedNumber
                    value={105}
                    // eslint-disable-next-line react/style-prop-object
                    style='currency'
                    currency='USD'
                />
            </div>
        </div>
        <div className='BillingSummary__lastInvoice-partialCharges'>
            <FormattedMessage
                id='admin.billing.subscriptions.billing_summary.lastInvoice.partialCharges'
                defaultMessage='Partial charges'
            />
            <OverlayTrigger
                delayShow={500}
                placement='bottom'
                overlay={(
                    <Tooltip
                        id='BillingSubscriptions__seatOverageTooltip'
                        className='BillingSubscriptions__tooltip BillingSubscriptions__tooltip-right'
                        positionLeft={390}
                    >
                        <div className='BillingSubscriptions__tooltipTitle'>
                            <FormattedMessage
                                id='admin.billing.subscriptions.billing_summary.lastInvoice.whatArePartialCharges'
                                defaultMessage='What are partial charges?'
                            />
                        </div>
                        <div className='BillingSubscriptions__tooltipMessage'>
                            <FormattedMessage
                                id='admin.billing.subscriptions.billing_summary.lastInvoice.whatArePartialCharges.message'
                                defaultMessage='Users who have not been enabled for the full duration of the month are charged at a prorated monthly rate.'
                            />
                        </div>
                    </Tooltip>
                )}
            >
                <i className='icon-information-outline'/>
            </OverlayTrigger>
        </div>
        <div className='BillingSummary__lastInvoice-charge'>
            <div className='BillingSummary__lastInvoice-chargeDescription'>
                {'14 users'}
            </div>
            <div className='BillingSummary__lastInvoice-chargeAmount'>
                <FormattedNumber
                    value={10.5}
                    // eslint-disable-next-line react/style-prop-object
                    style='currency'
                    currency='USD'
                />
            </div>
        </div>
        <div className='BillingSummary__lastInvoice-charge'>
            <div className='BillingSummary__lastInvoice-chargeDescription'>
                <FormattedMessage
                    id='admin.billing.subscriptions.billing_summary.lastInvoice.taxes'
                    defaultMessage='Taxes'
                />
            </div>
            <div className='BillingSummary__lastInvoice-chargeAmount'>
                <FormattedNumber
                    value={10}
                    // eslint-disable-next-line react/style-prop-object
                    style='currency'
                    currency='USD'
                />
            </div>
        </div>
        <hr/>
        <div className='BillingSummary__lastInvoice-charge total'>
            <div className='BillingSummary__lastInvoice-chargeDescription'>
                <FormattedMessage
                    id='admin.billing.subscriptions.billing_summary.lastInvoice.total'
                    defaultMessage='Total'
                />
            </div>
            <div className='BillingSummary__lastInvoice-chargeAmount'>
                <FormattedNumber
                    value={125.5}
                    // eslint-disable-next-line react/style-prop-object
                    style='currency'
                    currency='USD'
                />
            </div>
        </div>
        <div className='BillingSummary__lastInvoice-download'>
            <button className='BillingSummary__lastInvoice-downloadButton'>
                <i className='icon icon-file-pdf-outline'/>
                <FormattedMessage
                    id='admin.billing.subscriptions.billing_summary.lastInvoice.downloadInvoice'
                    defaultMessage='Download Invoice'
                />
            </button>
        </div>
        <BlockableLink
            to='/admin_console/billing/billing_history'
            className='BillingSummary__lastInvoice-billingHistory'
        >
            <FormattedMessage
                id='admin.billing.subscriptions.billing_summary.lastInvoice.seeBillingHistory'
                defaultMessage='See Billing History'
            />
        </BlockableLink>
    </div>
);

const BillingSummary: React.FC = () => {
    return (
        <div className='BillingSummary'>
            {lastInvoiceSummary}
        </div>
    );
};

export default BillingSummary;
