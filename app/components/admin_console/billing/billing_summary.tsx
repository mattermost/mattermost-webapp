// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedDate, FormattedMessage, FormattedNumber} from 'react-intl';
import {useSelector} from 'react-redux';

import {Client4} from 'mattermost-redux/client';

import {trackEvent} from 'actions/telemetry_actions';
import BlockableLink from 'components/admin_console/blockable_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import OverlayTrigger from 'components/overlay_trigger';
import {GlobalState} from 'types/store';
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

const getPaymentStatus = (status: string) => {
    switch (status) {
    case 'failed':
        return (
            <div className='BillingSummary__lastInvoice-headerStatus failed'>
                <FormattedMessage
                    id='admin.billing.subscriptions.billing_summary.lastInvoice.failed'
                    defaultMessage='Failed'
                />
                <i className='icon icon-alert-outline'/>
            </div>
        );
    case 'paid':
        return (
            <div className='BillingSummary__lastInvoice-headerStatus paid'>
                <FormattedMessage
                    id='admin.billing.subscriptions.billing_summary.lastInvoice.paid'
                    defaultMessage='Paid'
                />
                <i className='icon icon-check-circle-outline'/>
            </div>
        );
    default:
        return (
            <div className='BillingSummary__lastInvoice-headerStatus pending'>
                <FormattedMessage
                    id='admin.billing.subscriptions.billing_summary.lastInvoice.pending'
                    defaultMessage='Pending'
                />
                <i className='icon icon-check-circle-outline'/>
            </div>
        );
    }
};

const BillingSummary: React.FC = () => {
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const product = useSelector((state: GlobalState) => {
        if (state.entities.cloud.products && subscription) {
            return state.entities.cloud.products[subscription?.product_id];
        }
        return undefined;
    });

    let body = noBillingHistory;
    if (subscription && subscription.last_invoice) {
        const invoice = subscription.last_invoice;

        const fullCharges = invoice.line_items.filter((item) => item.type === 'full');
        const partialCharges = invoice.line_items.filter((item) => item.type === 'partial');

        body = (
            <div className='BillingSummary__lastInvoice'>
                <div className='BillingSummary__lastInvoice-header'>
                    <div className='BillingSummary__lastInvoice-headerTitle'>
                        <FormattedMessage
                            id='admin.billing.subscriptions.billing_summary.lastInvoice.title'
                            defaultMessage='Last Invoice'
                        />
                    </div>
                    {getPaymentStatus(invoice.status)}
                </div>
                <div className='BillingSummary__lastInvoice-date'>
                    <FormattedDate
                        value={new Date(invoice.period_start)}
                        month='short'
                        year='numeric'
                        day='numeric'
                        timeZone='UTC'
                    />
                </div>
                <div className='BillingSummary__lastInvoice-productName'>
                    {product?.name}
                </div>
                <hr/>
                {fullCharges.map((charge) => (
                    <div
                        key={charge.price_id}
                        className='BillingSummary__lastInvoice-charge'
                    >
                        <div className='BillingSummary__lastInvoice-chargeDescription'>
                            <FormattedNumber
                                value={(charge.price_per_unit / 100.0)}
                                // eslint-disable-next-line react/style-prop-object
                                style='currency'
                                currency='USD'
                            />
                            <FormattedMarkdownMessage
                                id='admin.billing.subscriptions.billing_summary.lastInvoice.userCount'
                                defaultMessage=' x {users} users'
                                values={{users: charge.quantity}}
                            />
                        </div>
                        <div className='BillingSummary__lastInvoice-chargeAmount'>
                            <FormattedNumber
                                value={(charge.total / 100.0)}
                                // eslint-disable-next-line react/style-prop-object
                                style='currency'
                                currency='USD'
                            />
                        </div>
                    </div>
                ))}
                {partialCharges.length &&
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
                }
                {partialCharges.map((charge) => (
                    <div
                        key={charge.price_id}
                        className='BillingSummary__lastInvoice-charge'
                    >
                        <div className='BillingSummary__lastInvoice-chargeDescription'>
                            <FormattedMarkdownMessage
                                id='admin.billing.subscriptions.billing_summary.lastInvoice.userCountPartial'
                                defaultMessage='{users} users'
                                values={{users: charge.quantity}}
                            />
                        </div>
                        <div className='BillingSummary__lastInvoice-chargeAmount'>
                            <FormattedNumber
                                value={(charge.total / 100.0)}
                                // eslint-disable-next-line react/style-prop-object
                                style='currency'
                                currency='USD'
                            />
                        </div>
                    </div>
                ))}
                {Boolean(invoice.tax) &&
                    <div className='BillingSummary__lastInvoice-charge'>
                        <div className='BillingSummary__lastInvoice-chargeDescription'>
                            <FormattedMessage
                                id='admin.billing.subscriptions.billing_summary.lastInvoice.taxes'
                                defaultMessage='Taxes'
                            />
                        </div>
                        <div className='BillingSummary__lastInvoice-chargeAmount'>
                            <FormattedNumber
                                value={(invoice.tax / 100.0)}
                                // eslint-disable-next-line react/style-prop-object
                                style='currency'
                                currency='USD'
                            />
                        </div>
                    </div>
                }
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
                            value={(invoice.total / 100.0)}
                            // eslint-disable-next-line react/style-prop-object
                            style='currency'
                            currency='USD'
                        />
                    </div>
                </div>
                <div className='BillingSummary__lastInvoice-download'>
                    <a
                        target='_new'
                        rel='noopener noreferrer'
                        href={Client4.getInvoicePdfUrl(invoice.id)}
                        className='BillingSummary__lastInvoice-downloadButton'
                    >
                        <i className='icon icon-file-pdf-outline'/>
                        <FormattedMessage
                            id='admin.billing.subscriptions.billing_summary.lastInvoice.downloadInvoice'
                            defaultMessage='Download Invoice'
                        />
                    </a>
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
    }

    return (
        <div className='BillingSummary'>
            {body}
        </div>
    );
};

export default BillingSummary;
