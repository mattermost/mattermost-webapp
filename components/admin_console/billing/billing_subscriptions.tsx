// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import AlertBanner from 'components/alert_banner';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import privateCloudImage from 'images/private-cloud-image.svg';

import PlanDetails from './plan_details';

import './billing_subscriptions.scss';

type Props = {

};

const privateCloudCard = () => (
    <div className='PrivateCloudCard'>
        <div className='PrivateCloudCard__text'>
            <div className='PrivateCloudCard__text-title'>
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.title'
                    defaultMessage='Looking for a high-trust private cloud?'
                />
            </div>
            <div className='PrivateCloudCard__text-description'>
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.description'
                    defaultMessage='If you need software with dedicated, single-tenant architecture, Mattermost Private Cloud (Beta) is the solution for high-trust collaboration.'
                />
            </div>
            <button className='PrivateCloudCard__contactSales'>
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.contactSales'
                    defaultMessage='Contact Sales'
                />
            </button>
        </div>
        <div className='PrivateCloudCard__image'>
            <img src={privateCloudImage}/>
        </div>
    </div>
);

const BillingSubscriptions: React.FC<Props> = () => {
    const [showDanger, setShowDanger] = useState(true);
    const [showWarning, setShowWarning] = useState(true);
    const [showInfo, setShowInfo] = useState(true);

    return (
        <div className='wrapper--fixed BillingSubscriptions'>
            <FormattedAdminHeader
                id='admin.billing.subscription.title'
                defaultMessage='Subscriptions'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {showDanger &&
                        <AlertBanner
                            mode='danger'
                            title='Test Danger Title'
                            message='This is a test danger message'
                            onDismiss={() => setShowDanger(false)}
                        />
                    }
                    {showWarning &&
                        <AlertBanner
                            mode='warning'
                            title='Test Warning Title'
                            message='This is a test warning message'
                            onDismiss={() => setShowWarning(false)}
                        />
                    }
                    {showInfo &&
                        <AlertBanner
                            mode='info'
                            title='Test Info Title'
                            message='This is a test info message'
                            onDismiss={() => setShowInfo(false)}
                        />
                    }
                    <div
                        className='BillingSubscriptions__topWrapper'
                        style={{marginTop: '20px'}}
                    >
                        <PlanDetails/>
                        <div style={{border: '1px solid #000', width: '332px', marginLeft: '20px'}}>
                            {'Billing Summary Card / Upgrade Mattermost Cloud'}
                        </div>
                    </div>
                    {privateCloudCard()}
                </div>
            </div>
        </div>
    );
};

export default BillingSubscriptions;
