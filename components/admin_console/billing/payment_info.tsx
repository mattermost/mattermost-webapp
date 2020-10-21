// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {getCloudCustomer} from 'mattermost-redux/actions/cloud';

import {pageVisited} from 'actions/telemetry_actions';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import PaymentInfoDisplay from './payment_info_display';

type Props = {

};

const PaymentInfo: React.FC<Props> = () => {
    const dispatch = useDispatch<DispatchFunc>();

    useEffect(() => {
        dispatch(getCloudCustomer());

        pageVisited('cloud_admin', 'pageview_billing_payment_info');
    }, []);

    return (
        <div className='wrapper--fixed PaymentInfo'>
            <FormattedAdminHeader
                id='admin.billing.payment_info.title'
                defaultMessage='Payment Information'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <PaymentInfoDisplay/>
                </div>
            </div>
        </div>
    );
};

export default PaymentInfo;
