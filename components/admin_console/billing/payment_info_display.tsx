// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import BlockableLink from 'components/admin_console/blockable_link';
import noPaymentInfoGraphic from 'images/no_payment_info_graphic.svg';
import {GlobalState} from 'types/store';

import './payment_info_display.scss';
import PaymentDetails from './payment_details';

const addInfoButton = (
    <div className='PaymentInfoDisplay__addInfo'>
        <BlockableLink
            to='/admin_console/billing/payment_info_edit'
            className='PaymentInfoDisplay__addInfoButton'
            onClick={() => trackEvent('cloud_admin', 'click_add_credit_card')}
        >
            <i className='icon icon-plus'/>
            <FormattedMessage
                id='admin.billing.payment_info.add'
                defaultMessage='Add a Credit Card'
            />
        </BlockableLink>
    </div>
);

const noPaymentInfoSection = (
    <div className='PaymentInfoDisplay__noPaymentInfo'>
        <img
            className='ComapnyInfoDisplay__noPaymentInfo-graphic'
            src={noPaymentInfoGraphic}
        />
        <div className='PaymentInfoDisplay__noPaymentInfo-message'>
            <FormattedMessage
                id='admin.billing.payment_info_display.noPaymentInfo'
                defaultMessage='There are currently no credit cards on file.'
            />
        </div>
        <BlockableLink
            to='/admin_console/billing/payment_info_edit'
            className='PaymentInfoDisplay__noPaymentInfo-link'
            onClick={() => trackEvent('cloud_admin', 'click_add_credit_card')}
        >
            <FormattedMessage
                id='admin.billing.payment_info.add'
                defaultMessage='Add a Credit Card'
            />
        </BlockableLink>
    </div>
);

const PaymentInfoDisplay: React.FC = () => {
    const paymentInfo = useSelector((state: GlobalState) => state.entities.cloud.customer);

    if (!paymentInfo) {
        return null;
    }

    let body = noPaymentInfoSection;

    if (paymentInfo?.payment_method && paymentInfo?.billing_address) {
        body = (
            <div className='PaymentInfoDisplay__paymentInfo'>
                <PaymentDetails/>
                <div className='PaymentInfoDisplay__paymentInfo-edit'>
                    { // TODO: remove payment info?
                    /* <a
                        href='#'
                        onClick={() => null}
                        className='PaymentInfoDisplay__paymentInfo-editButton'
                    >
                        <i className='icon icon-trash-can-outline'/>
                    </a> */}
                    <BlockableLink
                        to='/admin_console/billing/payment_info_edit'
                        className='PaymentInfoDisplay__paymentInfo-editButton'
                    >
                        <i className='icon icon-pencil-outline'/>
                    </BlockableLink>
                </div>
            </div>
        );
    }

    return (
        <div className='PaymentInfoDisplay'>
            <div className='PaymentInfoDisplay__header'>
                <div className='PaymentInfoDisplay__headerText'>
                    <div className='PaymentInfoDisplay__headerText-top'>
                        <FormattedMessage
                            id='admin.billing.payment_info_display.savedPaymentDetails'
                            defaultMessage='Your saved payment details'
                        />
                    </div>
                    <div className='PaymentInfoDisplay__headerText-bottom'>
                        <FormattedMessage
                            id='admin.billing.payment_info_display.allCardsAccepted'
                            defaultMessage='All major credit cards are accepted.'
                        />
                    </div>
                </div>
                {!(paymentInfo?.payment_method && paymentInfo?.billing_address) && addInfoButton}
            </div>
            <div className='PaymentInfoDisplay__body'>
                {body}
            </div>
        </div>
    );
};

export default PaymentInfoDisplay;
