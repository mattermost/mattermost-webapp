// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {Stripe} from '@stripe/stripe-js';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects
import {Elements} from '@stripe/react-stripe-js';

import {getCloudCustomer} from 'mattermost-redux/actions/cloud';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {completeStripeAddPaymentMethod} from 'actions/cloud';
import BlockableLink from 'components/admin_console/blockable_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import PaymentForm from 'components/payment_form/payment_form';
import {STRIPE_CSS_SRC, STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';
import SaveButton from 'components/save_button';
import {areBillingDetailsValid, BillingDetails} from 'types/cloud/sku';
import {GlobalState} from 'types/store';
import {CloudLinks} from 'utils/constants';
import {browserHistory} from 'utils/browser_history';

import './payment_info_edit.scss';
import AlertBanner from 'components/alert_banner';

let stripePromise: Promise<Stripe | null>;

const PaymentInfoEdit: React.FC = () => {
    const dispatch = useDispatch();
    const isDevMode = useSelector((state: GlobalState) => getConfig(state).EnableDeveloper === 'true');
    const paymentInfo = useSelector((state: GlobalState) => state.entities.cloud.customer);

    const [showCreditCardWarning, setShowCreditCardWarning] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
    const [isServerError, setIsServerError] = useState(false);
    const [billingDetails, setBillingDetails] = useState<BillingDetails>({
        address: paymentInfo?.billing_address?.line1 || '',
        address2: paymentInfo?.billing_address?.line2 || '',
        city: paymentInfo?.billing_address?.city || '',
        state: paymentInfo?.billing_address?.state || '',
        country: paymentInfo?.billing_address?.country || '',
        postalCode: paymentInfo?.billing_address?.postal_code || '',
        name: '',
        card: {} as any,
    });

    useEffect(() => {
        dispatch(getCloudCustomer());
    }, []);

    const onPaymentInput = (billing: BillingDetails) => {
        setIsServerError(false);
        setIsValid(areBillingDetailsValid(billing));
        setBillingDetails(billing);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const setPaymentMethod = completeStripeAddPaymentMethod((await stripePromise)!, billingDetails!, isDevMode);
        const success = await setPaymentMethod();

        if (success) {
            browserHistory.push('/admin_console/billing/payment_info');
        } else {
            setIsServerError(true);
        }

        setIsSaving(false);
    };

    if (!stripePromise) {
        stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
    }

    return (
        <div className='wrapper--fixed PaymentInfoEdit'>
            <div className='admin-console__header with-back'>
                <div>
                    <BlockableLink
                        to='/admin_console/billing/payment_info'
                        className='fa fa-angle-left back'
                    />
                    <FormattedMessage
                        id='admin.billing.payment_info_edit.title'
                        defaultMessage='Edit Payment Information'
                    />
                </div>
            </div>
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {showCreditCardWarning &&
                        <AlertBanner
                            mode='info'
                            title={
                                <FormattedMessage
                                    id='admin.billing.payment_info_edit.creditCardWarningTitle'
                                    defaultMessage='NOTE: Your card will not be charged at this time'
                                />
                            }
                            message={
                                <>
                                    <FormattedMarkdownMessage
                                        id='admin.billing.payment_info_edit.creditCardWarningDescription'
                                        defaultMessage='Credit cards are kept on file for future payments. You’ll only be charged if you move in to the paid tier of Mattermost Cloud and exceed the free tier limits. '
                                    />
                                    <a
                                        target='_new'
                                        rel='noopener noreferrer'
                                        href={CloudLinks.BILLING_DOCS}
                                    >
                                        <FormattedMessage
                                            id='admin.billing.subscription.planDetails.howBillingWorks'
                                            defaultMessage='See how billing works'
                                        />
                                    </a>
                                </>
                            }
                            onDismiss={() => setShowCreditCardWarning(false)}
                        />
                    }
                    <div className='PaymentInfoEdit__card'>
                        <Elements
                            options={{fonts: [{cssSrc: STRIPE_CSS_SRC}]}}
                            stripe={stripePromise}
                        >
                            <PaymentForm
                                className='PaymentInfoEdit__paymentForm'
                                onInputChange={onPaymentInput}
                                initialBillingDetails={billingDetails}
                            />
                        </Elements>
                    </div>
                </div>
            </div>
            <div className='admin-console-save'>
                <SaveButton
                    saving={isSaving}
                    disabled={!billingDetails || !isValid}
                    onClick={handleSubmit}
                    defaultMessage={(
                        <FormattedMessage
                            id='admin.billing.payment_info_edit.save'
                            defaultMessage='Save credit card'
                        />
                    )}
                />
                <BlockableLink
                    className='cancel-button'
                    to='/admin_console/billing/payment_info'
                >
                    <FormattedMessage
                        id='admin.billing.payment_info_edit.cancel'
                        defaultMessage='Cancel'
                    />
                </BlockableLink>
                {isValid === false &&
                    <span className='PaymentInfoEdit__error'>
                        <i className='icon icon-alert-outline'/>
                        <FormattedMessage
                            id='admin.billing.payment_info_edit.formError'
                            defaultMessage='There are errors in the form above'
                        />
                    </span>
                }
                {isServerError &&
                    <span className='PaymentInfoEdit__error'>
                        <i className='icon icon-alert-outline'/>
                        <FormattedMessage
                            id='admin.billing.payment_info_edit.serverError'
                            defaultMessage='Something went wrong while saving payment infomation'
                        />
                    </span>
                }
            </div>
        </div>
    );
};

export default PaymentInfoEdit;
