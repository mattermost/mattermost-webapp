// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getInvoices} from 'mattermost-redux/actions/cloud';
<<<<<<< HEAD
import {Client4} from 'mattermost-redux/client';
import {Invoice} from '@mattermost/types/cloud';
import {GlobalState} from '@mattermost/types/store';
import {openModal} from 'actions/views/modals';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';

=======
import {getSelfHostedInvoices as getSelfHostedInvoicesAction} from 'actions/hosted_customer';
import {getCloudErrors, getCloudInvoices, isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {getSelfHostedErrors, getSelfHostedInvoices} from 'mattermost-redux/selectors/entities/hosted_customer';
>>>>>>> master
import {pageVisited, trackEvent} from 'actions/telemetry_actions';

import CloudFetchError from 'components/cloud_fetch_error';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import EmptyBillingHistorySvg from 'components/common/svg_images_components/empty_billing_history_svg';

import {CloudLinks, ModalIdentifiers} from 'utils/constants';

import BillingHistoryTable from './billing_history_table';

import './billing_history.scss';
import CloudInvoicePreview from 'components/cloud_invoice_preview';

const noBillingHistorySection = (
    <div className='BillingHistory__noHistory'>
        <EmptyBillingHistorySvg
            width={300}
            height={210}
        />
        <div className='BillingHistory__noHistory-message'>
            <FormattedMessage
                id='admin.billing.history.noBillingHistory'
                defaultMessage='In the future, this is where your billing history will show.'
            />
        </div>
        <a
            target='_blank'
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

const BillingHistory = () => {
    const dispatch = useDispatch();
    const isCloud = useSelector(isCurrentLicenseCloud);
    const invoices = useSelector(isCloud ? getCloudInvoices : getSelfHostedInvoices);
    const {invoices: invoicesError} = useSelector(isCloud ? getCloudErrors : getSelfHostedErrors);

    useEffect(() => {
        pageVisited('cloud_admin', 'pageview_billing_history');
    }, []);
    useEffect(() => {
<<<<<<< HEAD
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
                <tbody>
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
                        const url = Client4.getInvoicePdfUrl(invoice.id);
                        return (
                            <tr
                                className='BillingHistory__table-row'
                                key={invoice.id}
                                onClick={() => {
                                    dispatch(
                                        openModal({
                                            modalId:
                                            ModalIdentifiers.CLOUD_INVOICE_PREVIEW,
                                            dialogType: CloudInvoicePreview,
                                            dialogProps: {
                                                url,
                                            },
                                        }),
                                    );
                                }}
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
                                    <div>{invoice.current_product_name}</div>
                                    <div className='BillingHistory__table-bottomDesc'>
                                        <InvoiceUserCount invoice={invoice}/>
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
                                        target='_self'
                                        rel='noopener noreferrer'
                                        href={url}
                                    >
                                        <i className='icon icon-file-pdf-outline'/>
                                    </a>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {paging}
        </>
    );

=======
        dispatch(isCloud ? getInvoices() : getSelfHostedInvoicesAction());
    }, [isCloud]);
    const billingHistoryTable = invoices && <BillingHistoryTable invoices={invoices}/>;
    const areInvoicesEmpty = Object.keys(invoices || {}).length === 0;
>>>>>>> master
    return (
        <div className='wrapper--fixed BillingHistory'>
            <FormattedAdminHeader
                id='admin.billing.history.title'
                defaultMessage='Billing History'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {invoicesError && <CloudFetchError/>}
                    {!invoicesError && <div className='BillingHistory__card'>
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
<<<<<<< HEAD
                                    {billingHistory ? billingHistoryTable : noBillingHistorySection}
=======
                                    {areInvoicesEmpty ? noBillingHistorySection : billingHistoryTable}
>>>>>>> master
                                </>
                            )}
                            {invoices == null && (
                                <div className='BillingHistory__spinner'>
                                    <LoadingSpinner/>
                                </div>
                            )}
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default BillingHistory;
