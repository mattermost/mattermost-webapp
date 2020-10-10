
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Stripe} from '@stripe/stripe-js';
import {getCode} from 'country-list';

import {Client4} from 'mattermost-redux/client';

import {getConfirmCardSetup} from 'components/payment_form/stripe';

import {StripeSetupIntent, BillingDetails} from 'types/cloud/sku';

// Returns true for success, and false for any error
export function completeStripeAddPaymentMethod(stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) {
    return async () => {
        let paymentSetupIntent: StripeSetupIntent;
        try {
            paymentSetupIntent = await Client4.createPaymentMethod() as StripeSetupIntent;
        } catch (error) {
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
            return false;
        }

        const {setupIntent, error: stripeError} = result;

        if (stripeError) {
            return false;
        }

        if (setupIntent == null) {
            return false;
        }

        if (setupIntent.status !== 'succeeded') {
            return false;
        }

        try {
            await Client4.confirmPaymentMethod(setupIntent.id);
        } catch (error) {
            return false;
        }

        return true;
    };
}
