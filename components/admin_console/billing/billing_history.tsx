// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
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

const BillingHistory: React.FC<Props> = () => {
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
                            {noBillingHistorySection}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingHistory;
