// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {useDispatch, useStore} from 'react-redux';

import {getCloudSubscriptionByInstallationId} from 'mattermost-redux/actions/cloud';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import AlertBanner from 'components/alert_banner';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import PlanDetails from './plan_details';

import './billing_subscriptions.scss';

type Props = {

};

const BillingSubscriptions: React.FC<Props> = () => {
    const dispatch = useDispatch<DispatchFunc>();
    const store = useStore();

    useEffect(() => {
        getCloudSubscriptionByInstallationId('test')(dispatch, store.getState());
    }, []);

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
                    <div style={{border: '1px solid #000', width: '100%', height: '217px', marginTop: '20px'}}>
                        {'Private Cloud'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSubscriptions;
