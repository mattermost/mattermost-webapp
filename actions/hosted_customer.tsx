// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Stripe} from '@stripe/stripe-js';

import {getCode} from 'country-list';

import {CreateSubscriptionRequest} from '@mattermost/types/cloud';
import {SelfHostedSignupProgress} from '@mattermost/types/hosted_customer';
import {ValueOf} from '@mattermost/types/utilities';

import {Client4} from 'mattermost-redux/client';
import {HostedCustomerTypes} from 'mattermost-redux/action_types';
import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {StripeSetupIntent, BillingDetails} from 'types/cloud/sku';

import {getConfirmCardSetup} from 'components/payment_form/stripe';

function selfHostedNeedsConfirmation(progress: ValueOf<typeof SelfHostedSignupProgress>): boolean {
    switch (progress) {
    case SelfHostedSignupProgress.START:
    case SelfHostedSignupProgress.CREATED_CUSTOMER:
    case SelfHostedSignupProgress.CREATED_INTENT:
        return true;
    default:
        return false;
    }
}

export function confirmSelfHostedSignup(
    stripe: Stripe,
    stripeSetupIntent: StripeSetupIntent,
    isDevMode: boolean,
    billingDetails: BillingDetails,
    initialProgress: ValueOf<typeof SelfHostedSignupProgress>,
    subscriptionRequest: CreateSubscriptionRequest,
): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        const cardSetupFunction = getConfirmCardSetup(isDevMode);
        const confirmCardSetup = cardSetupFunction(stripe.confirmCardSetup);

        const shouldConfirmCard = selfHostedNeedsConfirmation(initialProgress);
        if (shouldConfirmCard) {
            const result = await confirmCardSetup(
                stripeSetupIntent.client_secret,
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
                return {data: false, error: 'failed to confirm card with Stripe'};
            }

            const {setupIntent, error: stripeError} = result;

            if (stripeError) {
                return {data: false, error: stripeError.message || 'Stripe failed to confirm payment method'};
            }

            if (setupIntent === null || setupIntent === undefined) {
                return {data: false, error: 'Stripe did not return successful setup intent'};
            }

            if (setupIntent.status !== 'succeeded') {
                return {data: false, error: `Stripe setup intent status was: ${setupIntent.status}`};
            }
            dispatch({
                type: HostedCustomerTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS,
                data: SelfHostedSignupProgress.CONFIRMED_INTENT,
            });
        }

        try {
            const result = await Client4.confirmSelfHostedSignup(stripeSetupIntent.id, subscriptionRequest);
            dispatch({
                type: HostedCustomerTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS,
                data: result.progress,
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return {data: false};
        }

        return {data: true};
    };
}

export function getSelfHostedProducts(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            dispatch({
                type: HostedCustomerTypes.SELF_HOSTED_PRODUCTS_REQUEST,
            });
            const result = await Client4.getSelfHostedProducts();
            if (result) {
                dispatch({
                    type: HostedCustomerTypes.RECEIVED_SELF_HOSTED_PRODUCTS,
                    data: result,
                });
            }
        } catch (error) {
            dispatch({
                type: HostedCustomerTypes.SELF_HOSTED_PRODUCTS_FAILED,
            });
            return error;
        }
        return true;
    };
}
