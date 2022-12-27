// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Address, Product, Invoice} from './cloud';
import {ValueOf} from './utilities';

export const SelfHostedSignupProgress = {
    START: 'START',
    CREATED_CUSTOMER: 'CREATED_CUSTOMER',
    CREATED_INTENT: 'CREATED_INTENT',
    CONFIRMED_INTENT: 'CONFIRMED_INTENT',
    CREATED_SUBSCRIPTION: 'CREATED_SUBSCRIPTION',
    PAID: 'PAID',
    CREATED_LICENSE: 'CREATED_LICENSE',
} as const;

export interface SelfHostedSignupForm {
    first_name: string;
    last_name: string;
    billing_address: Address;
    organization: string;
}

export interface SelfHostedSignupCustomerResponse {
    customer_id: string;
    setup_intent_id: string;
    setup_intent_secret: string;
    progress: ValueOf<typeof SelfHostedSignupProgress>;
}

export interface SelfHostedSignupSuccessResponse {
    progress: ValueOf<typeof SelfHostedSignupProgress>;
    license: Record<string, string>;
}

export type HostedCustomerState = {
    products: {
        products: Record<string, Product>;
        productsLoaded: boolean;
    };
    invoices: {
        invoices: Record<string, Invoice>;
        invoicesLoaded: boolean;
    };
    errors: {
        products?: true;
        invoices?: true;
    };
    signupProgress: ValueOf<typeof SelfHostedSignupProgress>;
    trueUpReview: {
        status: TrueUpReviewStatus;
        profile: TrueUpReviewProfile;
    };
}


export type TrueUpReviewProfile = {
    server_id: string;
    server_version: string;
    server_installation_type: string;
    license_id: string;
    licensed_seats: number;
    license_plan: string;
    customer_name: string;
    active_users: number;
    authentication_features: string[];
    plugins: TrueUpReviewPlugins;
    total_incoming_webhooks: number;
    total_outgoing_webhooks: number;
}

export type TrueUpReviewPlugins = {
    total_active_plugins: number;
    total_inactive_plugins: number;
    active_plugin_names: string[];
    inactive_plugin_names: string[];
}

export type TrueUpReviewStatus = {
    due_date: number;
    complete: boolean;
}