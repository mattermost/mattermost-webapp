// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {StripeCardElement} from '@stripe/stripe-js';

//import {LogoutAction} from './user';

export type SKU = {
    id: string;
    name: string;
    description: string;
    dollars_per_seat: number;
    add_ons?: AddOn[];
}

export type AddOn = {
    id: string;
    name: string;
    display_name: string;
    dollars_per_seat: number;
}

export const UI_SELECT_SKUS = 'UI_SELECT_SKUS';
export const SET_SKUS = 'SET_SKUS';

export type UISelectSKUAction = {
    type: typeof UI_SELECT_SKUS;
    skus: string[];
};

export type SetSKUsAction = {
    type: typeof SET_SKUS;
    skus: SKU[];
};

//export type SKUActionType = UISelectSKUAction | SetSKUsAction | LogoutAction;

export const UI_SELECT_ADDONS = 'UI_SELECT_ADDONS';

export type UISelectAddOnAction = {
    type: typeof UI_SELECT_ADDONS;
    addOns: string[];
};

//export type AddOnActionType = UISelectAddOnAction | LogoutAction;

export const UI_SELECT_SEATS = 'UI_SELECT_SEATS';

export type UISelectSeatsAction = {
    type: typeof UI_SELECT_SEATS;
    seats: number;
};

//export type SeatsActionType = UISelectSeatsAction | LogoutAction;

export type BillingDetails = {
    address: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    name: string;
    card: StripeCardElement;
    agreedTerms?: boolean;
};

export const areBillingDetailsValid = (billingDetails: BillingDetails | null | undefined): boolean => {
    if (billingDetails == null) {
        return false;
    }

    return Boolean(
        billingDetails.address &&
        billingDetails.city &&
        billingDetails.state &&
        billingDetails.country &&
        billingDetails.postalCode &&
        billingDetails.name
    );
};

/*export const UI_SET_BILLING = 'UI_SET_BILLING';

export type SetBillingDetailsAction = {
    type: typeof UI_SET_BILLING;
    billing: BillingDetails;
};*/

//export type BillingActionType = SetBillingDetailsAction | LogoutAction;
