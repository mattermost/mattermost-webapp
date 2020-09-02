// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

type Props = {

};

const BillingHistory: React.FC<Props> = () => {
    return (
        <div className='wrapper--fixed BillingHistory'>
            <FormattedAdminHeader
                id='admin.billing.history.title'
                defaultMessage='Billing History'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <div style={{border: '1px solid #000', width: '100%', height: '463px'}}>
                        {'Billing History Table View'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingHistory;
