// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {getCloudCustomer} from 'mattermost-redux/actions/cloud';
import {GlobalState} from 'mattermost-redux/types/store';

import {pageVisited} from 'actions/telemetry_actions';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import AlertBanner from 'components/alert_banner';

import PaymentInfoDisplay from './payment_info_display';

import './payment_info.scss';

type Props = {

};

const PaymentInfo: React.FC<Props> = () => {
    const dispatch = useDispatch<DispatchFunc>();
    const customer = useSelector((state: GlobalState) => state.entities.cloud.customer);

    const isCreditCardAboutToExpire = () => {
        if (!customer) {
            return false;
        }

        // Will developers ever learn? :D
        const expiryYear = customer.payment_method.exp_year + 2000;

        // This works because we store the expiry month as the actual 1-12 base month, but Date uses a 0-11 base month
        // But credit cards expire at the end of their expiry month, so we can just use that number.
        const lastExpiryDate = new Date(expiryYear, customer.payment_method.exp_month, 1);
        const currentDatePlus10Days = new Date();
        currentDatePlus10Days.setDate(currentDatePlus10Days.getDate() + 10);
        return lastExpiryDate <= currentDatePlus10Days;
    };

    const [showCreditCardBanner, setShowCreditCardBanner] = useState(isCreditCardAboutToExpire());

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
                    {showCreditCardBanner && (
                        <AlertBanner
                            mode='info'
                            title={
                                <FormattedMessage
                                    id='admin.billing.payment_info.creditCardAboutToExpire'
                                    defaultMessage='Your credit card is about to expire'
                                />
                            }
                            message={
                                <FormattedMessage
                                    id='admin.billing.payment_info.creditCardAboutToExpire.description'
                                    defaultMessage='Please update your payment information to avoid any disruption.'
                                />
                            }
                            onDismiss={() => setShowCreditCardBanner(false)}
                        />
                    )}
                    <PaymentInfoDisplay/>
                </div>
            </div>
        </div>
    );
};

export default PaymentInfo;
