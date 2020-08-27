// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

//import {LogoutAction} from './user';

export type Customer = {
    id: string;
    name: string;
    email: string;
    billing_address: Address;
    company_address: Address;
    payment_method: PaymentMethod;
}

export type Address = {
    city: string;
    state: string;
    country: string;
    postal_code: string;
    line1: string;
    line2: string;
}

export type PaymentMethod = {
    type: string;
    last_four: number;
    exp_month: number;
    exp_year: number;
    card_brand: string;
}

export const SET_CUSTOMER = 'SET_CUSTOMER';

export type SetCustomerAction = {
    type: typeof SET_CUSTOMER;
    customer: Customer;
};

//export type CustomerActionType = SetCustomerAction | LogoutAction;
