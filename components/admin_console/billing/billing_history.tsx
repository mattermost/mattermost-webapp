// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getInvoices} from 'mattermost-redux/actions/cloud';
import {GlobalState} from '@mattermost/types/store';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import EmptyBillingHistorySvg from 'components/common/svg_images_components/empty_billing_history_svg';

import {CloudLinks} from 'utils/constants';

import BillingHistoryTable from './billing_history_table';

import './billing_history.scss';

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
    const invoices = useSelector((state: GlobalState) => state.entities.cloud.invoices);
    useEffect(() => {
        dispatch(getInvoices());
        pageVisited('cloud_admin', 'pageview_billing_history');
    }, []);
    const billingHistoryTable = invoices && <BillingHistoryTable invoices={invoices}/>;
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
                                    {invoices ? billingHistoryTable : noBillingHistorySection}
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
