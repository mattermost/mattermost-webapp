// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedDate, FormattedMessage, FormattedNumber} from 'react-intl';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import noBillingHistoryGraphic from 'images/no_billing_history_graphic.svg';

import './billing_history.scss';

type Props = {

};

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
            target='_blank'
            rel='noopener noreferrer'
            href='http://www.google.com'
            className='BillingHistory__noHistory-link'
        >
            <FormattedMessage
                id='admin.billing.history.seeHowBillingWorks'
                defaultMessage='See how billing works'
            />
        </a>
    </div>
);

// TODO: Temp data
const billingInfo: any = [
    {
        id: 1,
        date: new Date(2020, 5, 16),
        product_name: 'Mattermost Professional Cloud',
        charge_desc: '50 users at full rate, 14 users with partial charges',
        total: 125.5,
        status: 'Payment failed',
    },
    {
        id: 2,
        date: new Date(2020, 5, 6),
        product_name: 'Mattermost Professional Cloud',
        charge_desc: '50 users at full rate, 14 users with partial charges',
        total: 125.5,
        status: 'Pending',
        invoice: 'http://www.google.com',
    },
    {
        id: 3,
        date: new Date(2020, 5, 16),
        product_name: 'Mattermost Professional Cloud',
        charge_desc: '30 users at full rate, 14 users with partial charges',
        total: 71.5,
        status: 'Paid',
        invoice: 'http://www.google.com',
    },
    {
        id: 4,
        date: new Date(2020, 5, 6),
        product_name: 'Mattermost Professional Cloud',
        charge_desc: '30 users at full rate, 14 users with partial charges',
        total: 71.5,
        status: 'Paid',
        invoice: 'http://www.google.com',
    },
];

const getPaymentStatus = (status: string) => {
    switch (status) {
    case 'Payment failed':
        return (
            <div className='BillingHistory__paymentStatus failed'>
                <i className='icon icon-alert-outline'/>
                <FormattedMessage
                    id='admin.billing.history.paymentFailed'
                    defaultMessage='Payment failed'
                />
            </div>
        );
    case 'Pending':
        return (
            <div className='BillingHistory__paymentStatus pending'>
                <i className='icon icon-check-circle-outline'/>
                <FormattedMessage
                    id='admin.billing.history.pending'
                    defaultMessage='Pending'
                />
            </div>
        );
    case 'Paid':
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
        return null;
    }
};

const BillingHistory: React.FC<Props> = () => {
    const [billingHistory, setBillingHistory] = useState(billingInfo);

    const showNoBillingHistoryView = () => {
        setBillingHistory(undefined);
    };

    const previousPage = () => {};
    const nextPage = () => {};

    const billingHistoryTable = billingHistory && (
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
            {billingHistory.map((info: any) => (
                <tr
                    className='BillingHistory__table-row'
                    key={info.id}
                >
                    <td>
                        <FormattedDate
                            value={info.date}
                            month='2-digit'
                            day='2-digit'
                            year='numeric'
                        />
                    </td>
                    <td>
                        <div>{info.product_name}</div>
                        <div className='BillingHistory__table-bottomDesc'>{info.charge_desc}</div>
                    </td>
                    <td className='BillingHistory__table-total'>
                        <FormattedNumber
                            value={info.total}
                            // eslint-disable-next-line react/style-prop-object
                            style='currency'
                            currency='USD'
                        />
                    </td>
                    <td>
                        {getPaymentStatus(info.status)}
                    </td>
                    <td className='BillingHistory__table-invoice'>
                        {info.invoice &&
                            <a href={info.invoice}>
                                <i className='icon icon-file-pdf-outline'/>
                            </a>
                        }
                    </td>
                </tr>
            ))}
        </table>
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
                            {billingHistory ? billingHistoryTable : noBillingHistorySection}
                            <div className='BillingHistory__paging'>
                                <FormattedMarkdownMessage
                                    id='admin.billing.history.pageInfo'
                                    defaultMessage='{startRecord} - {endRecord} of {totalRecords}'
                                    values={{
                                        startRecord: 1,
                                        endRecord: 4,
                                        totalRecords: 4,
                                    }}
                                />
                                <button
                                    onClick={previousPage}
                                    disabled={true}
                                >
                                    <i className='icon icon-chevron-left'/>
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={false}
                                >
                                    <i className='icon icon-chevron-right'/>
                                </button>
                            </div>
                        </div>
                    </div>
                    <button onClick={showNoBillingHistoryView}>{'Show No Billing History View'}</button>
                </div>
            </div>
        </div>
    );
};

export default BillingHistory;
