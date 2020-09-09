
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Stripe} from '@stripe/stripe-js';
import {getCode} from 'country-list';

import {Client4} from 'mattermost-redux/client';

import {BillingDetails} from 'components/cloud/types/sku';

import {getConfirmCardSetup} from 'components/cloud/purchase_modal/stripe';

export function getProductPrice() {
    return async () => {
        let cloudProducts;
        try {
            cloudProducts = await Client4.getCloudProducts();
        } catch (error) {
        // eslint-disable-next-line no-console
            console.error(`Error fetching cloud products: ${error}`);
        }

        let productPrice = 0;
        if (cloudProducts?.length > 0) {
            productPrice = cloudProducts[0].dollars_per_seat;
        }

        console.log('PRICE IN FETCH ' + productPrice);

        return productPrice;
    };
}

export function completeStripeAddPaymentMethod(stripe: Stripe, billingDetails: BillingDetails) {
    return async (/*dispatch: DispatchFunc, getState: GetStateFunc*/) => {
        // const {data: paymentSetupIntent, error} = await Client4.createPaymentMethod();

        let paymentSetupIntent;
        try {
            paymentSetupIntent = await Client4.createPaymentMethod();
        } catch (error) {
            console.log(error);

            return {error};
        }

        console.log('RECEIVED PAYMENT INTENT: ');
        console.log(paymentSetupIntent);

        const confirmCardSetup = getConfirmCardSetup(stripe.confirmCardSetup);

        const result = await confirmCardSetup(
            paymentSetupIntent.client_secret,
            {
                payment_method: {
                    card: billingDetails.card,
                    billing_details: {
                        name: billingDetails.name,
                        address: {
                            line1: billingDetails.address,
                            line2: billingDetails.address2,
                            city: billingDetails.city,
                            state: billingDetails.state,
                            country: getCode(billingDetails.country),
                            postal_code: billingDetails.postalCode,
                        }
                    }
                }
            }
        );

        console.log('CONFIRM CARD RESULTS:');
        console.log(result);

        if (!result) {
            console.error('Stripe confirm card setup failed.'); //eslint-disable-line no-console
            return {error: 'Stripe confirm card failed'};//'intl.formatMessage({id: 'errors.generic_payment_failure'})'};
        }

        const {setupIntent, error: stripeError} = result;

        if (stripeError) {
            console.error(`Stripe error. decline_code=${stripeError.decline_code}`); //eslint-disable-line no-console
            return {error: stripeError.message};
        }

        if (setupIntent == null) {
            console.error('Stripe setup intent not set.'); //eslint-disable-line no-console
            return {error: 'Stripe setup intent error'}; //intl.formatMessage({id: 'errors.generic_payment_failure'})};
        }

        if (setupIntent.status !== 'succeeded') {
            console.error(`Payment intent status ${setupIntent?.status} instead of 'succeeded'.`); //eslint-disable-line no-console
            return {error: 'Stripe setup intent not succeeded'}; //intl.formatMessage({id: 'errors.generic_payment_failure'})};
        }

        try {
            console.log('CONFIRMING PAYMENT METHOD');
            await Client4.confirmPaymentMethod(setupIntent.id);
            console.log('CONFIRMING PAYMENT METHOD - COMPLETED');
        } catch (error) {
            console.error(error); //eslint-disable-line no-console
            return {error: 'Error confirming payment'//intl.formatMessage({id: 'errors.generic_payment_failure'})};
            };
        }
    }
    ;
}
