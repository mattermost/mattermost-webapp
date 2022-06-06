// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Stripe} from '@stripe/stripe-js';
import {getCode} from 'country-list';

import {FileSizes} from 'utils/file_utils';

import {Client4} from 'mattermost-redux/client';
import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';

import {getConfirmCardSetup} from 'components/payment_form/stripe';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import {StripeSetupIntent, BillingDetails} from 'types/cloud/sku';
import {CloudTypes} from 'mattermost-redux/action_types';

// Returns true for success, and false for any error
export function completeStripeAddPaymentMethod(
    stripe: Stripe,
    billingDetails: BillingDetails,
    isDevMode: boolean,
) {
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

export function subscribeCloudSubscription(productId: string) {
    return async () => {
        try {
            await Client4.subscribeCloudProduct(productId);
        } catch (error) {
            return error;
        }
        return true;
    };
}

export function requestCloudTrial(page: string, email = '') {
    trackEvent('api', 'api_request_cloud_trial_license', {from_page: page});
    return async () => {
        try {
            await Client4.requestCloudTrial(email);
        } catch (error) {
            return false;
        }
        return true;
    };
}

export function validateBusinessEmail() {
    trackEvent('api', 'api_validate_business_email');
    return async () => {
        try {
            await Client4.validateBusinessEmail();
        } catch (error) {
            return false;
        }
        return true;
    };
}

export function getCloudLimits(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            const result = await Client4.getCloudLimits();
            if (result) {
                dispatch({
                    type: CloudTypes.RECEIVED_CLOUD_LIMITS,
                    data: result,
                });
            }
        } catch (error) {
            return error;
        }
        return true;
    };
}

export function getMessagesUsage(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            const result = await Client4.getPostsUsage();
            if (result) {
                dispatch({
                    type: CloudTypes.RECEIVED_MESSAGES_USAGE,
                    data: result.count,
                });
            }
        } catch (error) {
            return error;
        }
        return true;
    };
}

export function getFilesUsage(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: CloudTypes.RECEIVED_FILES_USAGE,

            // TODO: Fill this in with the backing client API method once it is available in the server
            data: 3 * FileSizes.Gigabyte,
        });
        return {data: true};
    };
}

export function getIntegrationsUsage(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        const data = await Client4.getIntegrationsUsage();
        dispatch({
            type: CloudTypes.RECEIVED_INTEGRATIONS_USAGE,
            data: data.enabled,
        });

        return {data: true};
    };
}

export function getBoardsUsage(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            const result = await Client4.getBoardsUsage();
            if (result) {
                dispatch({
                    type: CloudTypes.RECEIVED_BOARDS_USAGE,

                    // the views and cards properties are the limits, not usage.
                    // So they are not passed in to the usage.
                    data: result.used_cards,
                });
            }
        } catch (error) {
            return error;
        }
        return {data: true};
    };
}

export function getTeamsUsage(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            const result = await Client4.getTeamsUsage();
            if (result) {
                dispatch({
                    type: CloudTypes.RECEIVED_TEAMS_USAGE,
                    data: {active: result.active, cloudArchived: result.cloud_archived},
                });
            }
        } catch (error) {
            return error;
        }
        return {data: false};
    };
}
