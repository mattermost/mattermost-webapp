// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedDate, FormattedMessage, FormattedNumber} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getCloudProducts, getCloudSubscription, getInvoices} from 'mattermost-redux/actions/cloud';
import {Client4} from 'mattermost-redux/client';
import {Invoice} from 'mattermost-redux/types/cloud';
import {GlobalState} from 'mattermost-redux/types/store';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import noBillingHistoryGraphic from 'images/no_billing_history_graphic.svg';
import {CloudLinks} from 'utils/constants';

import './billing_history.scss';

type Props = {

};

const PAGE_LENGTH = 4;

const noBillingHistorySection = (
    <div className='BillingHistory__noHistory'>
        <img
            className='BillingHistory__noHistory-graphic'
            src={noBillingHistoryGraphic}
        />
        <div className='BillingHistory__noHistory-message'>
            <FormattedMessage
                id='admin.billing.history.noBillingHistory'
                defaultMessage='In the future, this is where your billing history will show.'
            />
        </div>
        <a
            target='_new'
            rel='noopener noreferrer'
            href={CloudLinks.BILLING_DOCS}
            className='BillingHistory__noHistory-link'
            onClick={() => trackEvent('cloud_admin', 'click_billing_history', {screen: 'billing'})}
        >
            <FormattedMessage
                id='admin.billing.history.seeHowBillingWorks'
                defaultMessage='See how billing works'
            />
        </a>
    </div>
);

const getPaymentStatus = (status: string) => {
    switch (status) {
    case 'failed':
        return (
            <div className='BillingHistory__paymentStatus failed'>
                <i className='icon icon-alert-outline'/>
                <FormattedMessage
                    id='admin.billing.history.paymentFailed'
                    defaultMessage='Payment failed'
                />
            </div>
        );
    case 'paid':
        return (
            <div className='BillingHistory__paymentStatus paid'>
                <i className='icon icon-check-circle-outline'/>
                <FormattedMessage
                    id='admin.billing.history.paid'
                    defaultMessage='Paid'
                />
            </div>
        );
    default:
        return (
            <div className='BillingHistory__paymentStatus pending'>
                <i className='icon icon-check-circle-outline'/>
                <FormattedMessage
                    id='admin.billing.history.pending'
                    defaultMessage='Pending'
                />
            </div>
        );
    }
};

const BillingHistory: React.FC<Props> = () => {
    const dispatch = useDispatch();
    const invoices = useSelector((state: GlobalState) => state.entities.cloud.invoices);
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const product = useSelector((state: GlobalState) => {
        if (state.entities.cloud.products && subscription) {
            return state.entities.cloud.products[subscription?.product_id];
        }
        return undefined;
    });

    const [billingHistory, setBillingHistory] = useState<Invoice[] | undefined>(undefined);
    const [firstRecord, setFirstRecord] = useState(1);

    const previousPage = () => {
        if (firstRecord > PAGE_LENGTH) {
            setFirstRecord(firstRecord - PAGE_LENGTH);
        }
    };
    const nextPage = () => {
        if (invoices && (firstRecord + PAGE_LENGTH) < Object.values(invoices).length) {
            setFirstRecord(firstRecord + PAGE_LENGTH);
        }

        // TODO: When server paging, check if there are more invoices
    };
    useEffect(() => {
        dispatch(getCloudProducts());
        dispatch(getCloudSubscription());
        dispatch(getInvoices());
        pageVisited('cloud_admin', 'pageview_billing_history');
    }, []);

    useEffect(() => {
        if (invoices && Object.values(invoices).length) {
            const invoicesByDate = Object.values(invoices).sort((a, b) => b.period_start - a.period_start);
            setBillingHistory(invoicesByDate.slice(firstRecord - 1, (firstRecord - 1) + PAGE_LENGTH));
        }
    }, [invoices, firstRecord]);

    const paging = (
        <div className='BillingHistory__paging'>
            <FormattedMarkdownMessage
                id='admin.billing.history.pageInfo'
                defaultMessage='{startRecord} - {endRecord} of {totalRecords}'
                values={{
                    startRecord: firstRecord,
                    endRecord: Math.min(firstRecord + (PAGE_LENGTH - 1), Object.values(invoices || []).length),
                    totalRecords: Object.values(invoices || []).length,
                }}
            />
            <button
                onClick={previousPage}
                disabled={firstRecord <= PAGE_LENGTH}
            >
                <i className='icon icon-chevron-left'/>
            </button>
            <button
                onClick={nextPage}
                disabled={!invoices || (firstRecord + PAGE_LENGTH) >= Object.values(invoices).length}
            >
                <i className='icon icon-chevron-right'/>
            </button>
        </div>
    );

    const billingHistoryTable = billingHistory && (
        <>
            <table className='BillingHistory__table'>
                <tr className='BillingHistory__table-header'>
                    <th>
                        <FormattedMessage
                            id='admin.billing.history.date'
                            defaultMessage='Date'
                        />
                    </th>
                    <th>
                        <FormattedMessage
                            id='admin.billing.history.description'
                            defaultMessage='Description'
                        />
                    </th>
                    <th className='BillingHistory__table-headerTotal'>
                        <FormattedMessage
                            id='admin.billing.history.total'
                            defaultMessage='Total'
                        />
                    </th>
                    <th>
                        <FormattedMessage
                            id='admin.billing.history.status'
                            defaultMessage='Status'
                        />
                    </th>
                    <th>{''}</th>
                </tr>
                {billingHistory.map((invoice: Invoice) => {
                    const fullUsers = invoice.line_items.filter((item) => item.type === 'full').reduce((val, item) => val + item.quantity, 0);
                    const partialUsers = invoice.line_items.filter((item) => item.type === 'partial').reduce((val, item) => val + item.quantity, 0);

                    return (
                        <tr
                            className='BillingHistory__table-row'
                            key={invoice.id}
                        >
                            <td>
                                <FormattedDate
                                    value={new Date(invoice.period_start)}
                                    month='2-digit'
                                    day='2-digit'
                                    year='numeric'
                                    timeZone='UTC'
                                />
                            </td>
                            <td>
                                <div>{product?.name}</div>
                                <div className='BillingHistory__table-bottomDesc'>
                                    <FormattedMarkdownMessage
                                        id='admin.billing.history.usersAndRates'
                                        defaultMessage='{fullUsers} users at full rate, {partialUsers} users with partial charges'
                                        values={{
                                            fullUsers,
                                            partialUsers,
                                        }}
                                    />
                                </div>
                            </td>
                            <td className='BillingHistory__table-total'>
                                <FormattedNumber
                                    value={(invoice.total / 100.0)}
                                    // eslint-disable-next-line react/style-prop-object
                                    style='currency'
                                    currency='USD'
                                />
                            </td>
                            <td>
                                {getPaymentStatus(invoice.status)}
                            </td>
                            <td className='BillingHistory__table-invoice'>
                                <a
                                    target='_new'
                                    rel='noopener noreferrer'
                                    href={Client4.getInvoicePdfUrl(invoice.id)}
                                >
                                    <i className='icon icon-file-pdf-outline'/>
                                </a>
                            </td>
                        </tr>
                    );
                })}
            </table>
            {paging}
        </>
    );

    return (
        <div className='wrapper--fixed BillingHistory'>
            <FormattedAdminHeader
                id='admin.billing.history.title'
                defaultMessage='Billing History'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <div className='BillingHistory__card'>
                        <div className='BillingHistory__cardHeader'>
                            <div className='BillingHistory__cardHeaderText'>
                                <div className='BillingHistory__cardHeaderText-top'>
                                    <FormattedMessage
                                        id='admin.billing.history.transactions'
                                        defaultMessage='Transactions'
                                    />
                                </div>
                                <div className='BillingHistory__cardHeaderText-bottom'>
                                    <FormattedMessage
                                        id='admin.billing.history.allPaymentsShowHere'
                                        defaultMessage='All of your monthly payments will show here'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='BillingHistory__cardBody'>
                            {invoices != null && (
                                <>
                                    {billingHistory ?
                                        billingHistoryTable :
                                        noBillingHistorySection}
                                </>
                            )}
                            {invoices == null && (
                                <div className='BillingHistory__spinner'>
                                    <LoadingSpinner/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingHistory;
