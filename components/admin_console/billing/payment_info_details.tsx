// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import CardImage from 'components/payment_form/card_image';
import {GlobalState} from 'types/store';

export interface PaymentInfoDetailsProps {
    children?: React.ReactNode;
}

const PaymentInfoDetails: React.FC<PaymentInfoDetailsProps> = ({children}: PaymentInfoDetailsProps) => {
    const paymentInfo = useSelector((state: GlobalState) => state.entities.cloud.customer);

    if (!paymentInfo?.payment_method && !paymentInfo?.billing_address) {
        return null;
    }
    const address = paymentInfo.billing_address;

    return (
        <div className='PaymentInfoDisplay__paymentInfo-text'>
            <CardImage brand={paymentInfo.payment_method.card_brand}/>
            <div className='PaymentInfoDisplay__paymentInfo-cardInfo'>
                <FormattedMarkdownMessage
                    id='admin.billing.payment_info.cardBrandAndDigits'
                    defaultMessage='{brand} ending in {digits}'
                    values={{
                        brand: paymentInfo.payment_method.card_brand,
                        digits: paymentInfo.payment_method.last_four,
                    }}
                />
                <br/>
                <FormattedMarkdownMessage
                    id='admin.billing.payment_info.cardExpiry'
                    defaultMessage='Expires {month}/{year}'
                    values={{
                        month: String(paymentInfo.payment_method.exp_month).padStart(2, '0'),
                        year: String(paymentInfo.payment_method.exp_year).padStart(2, '0'),
                    }}
                />
            </div>
            <div className='PaymentInfoDisplay__paymentInfo-addressTitle'>
                <FormattedMessage
                    id='admin.billing.payment_info.billingAddress'
                    defaultMessage='Billing Address'
                />
            </div>
            <div className='PaymentInfoDisplay__paymentInfo-address'>
                <div>{address.line1}</div>
                {address.line2 && <div>{address.line2}</div>}
                <div>{`${address.city}, ${address.state}, ${address.postal_code}`}</div>
                <div>{address.country}</div>
            </div>
            {children || null}
        </div>
    );
};

export default PaymentInfoDetails;
