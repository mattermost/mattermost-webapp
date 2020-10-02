
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Stripe} from '@stripe/stripe-js';
import {getCode} from 'country-list';

import {Client4} from 'mattermost-redux/client';
import {Product} from 'mattermost-redux/types/cloud';

import {getConfirmCardSetup} from 'components/payment_form/stripe';

import {StripeSetupIntent, BillingDetails} from 'types/cloud/sku';

export function getProductPrice() {
    return async () => {
        let cloudProducts = [] as Product[];

        try {
            cloudProducts = await Client4.getCloudProducts();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error fetching cloud products: ${error}`);
        }

        let productPrice = 0;
        if (cloudProducts.length > 0) {
            // Assuming the first and only one for now.
            productPrice = cloudProducts[0].price_per_seat;
        }

        return productPrice;
    };
}

// Returns true for success, and false for any error
export function completeStripeAddPaymentMethod(stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) {
    return async () => {
        let paymentSetupIntent: StripeSetupIntent;
        try {
            paymentSetupIntent = await Client4.createPaymentMethod() as StripeSetupIntent;
        } catch (error) {
            console.error(error); //eslint-disable-line no-console
            return error;
        }
        const cardSetupFunction = getConfirmCardSetup(isDevMode);
        const confirmCardSetup = cardSetupFunction(stripe.confirmCardSetup);

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
                        },
                    },
                },
            },
        );

        if (!result) {
            console.error('Stripe confirm card setup failed.'); //eslint-disable-line no-console
            return false;
        }

        const {setupIntent, error: stripeError} = result;

        if (stripeError) {
            console.error(`Stripe error. decline_code=${stripeError.decline_code}`); //eslint-disable-line no-console
            return false;
        }

        if (setupIntent == null) {
            console.error('Stripe setup intent not set.'); //eslint-disable-line no-console
            return false;
        }

        if (setupIntent.status !== 'succeeded') {
            console.error(`Payment intent status ${setupIntent?.status} instead of 'succeeded'.`); //eslint-disable-line no-console
            return false;
        }

        try {
            await Client4.confirmPaymentMethod(setupIntent.id);
        } catch (error) {
            console.error(error); //eslint-disable-line no-console
            return false;
        }

        return true;
    };
}
