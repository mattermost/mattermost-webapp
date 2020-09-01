// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import './billing_subscriptions.scss';
import AlertBanner from 'components/alert_banner';

type Props = {

};

const BillingSubscriptions: React.FC<Props> = () => {
    return (
        <div className='wrapper--fixed BillingSubscriptions'>
            <FormattedAdminHeader
                id='admin.billing.subscription.title'
                defaultMessage='Subscriptions'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <AlertBanner
                        mode='danger'
                        title='Test Danger Title'
                        message='This is a test danger message'
                        onDismiss={() => null}
                    />
                    <AlertBanner
                        mode='warning'
                        title='Test Warning Title'
                        message='This is a test warning message'
                        onDismiss={() => null}
                    />
                    <AlertBanner
                        mode='info'
                        title='Test Info Title'
                        message='This is a test info message'
                        onDismiss={() => null}
                    />
                    <div
                        className='BillingSubscriptions__topWrapper'
                        style={{marginTop: '20px'}}
                    >
                        <div style={{border: '1px solid #000', width: '568px', height: '438px'}}>
                            {'Plan Details Card'}
                        </div>
                        <div style={{border: '1px solid #000', width: '332px', marginLeft: '20px'}}>
                            {'Billing Summary Card / Upgrade Mattermost Cloud'}
                        </div>
                    </div>
                    <div style={{border: '1px solid #000', width: '100%', height: '217px', marginTop: '20px'}}>
                        {'Private Cloud'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSubscriptions;
