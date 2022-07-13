// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type SelfHostedState = {
    subscription?: SelfHostedSubscription;
    products?: Record<string, SelfHostedProduct>;
    customer?: SelfHostedCustomer;
}

export type SelfHostedProduct = {
    id: string;
    name: string;
    description: string;
    price_per_year: number;
    sku: string;
    product_family: string;
};

export type SelfHostedSubscription = {
    id: string;
    customer_id: string;
    product_id: string;
    start_at: number;
    end_at: number;
    create_at: number;
    seats: number;
    trial_end_at: number;
    is_free_trial: string;
}

export type SelfHostedCustomer = {
    id: string;
}
