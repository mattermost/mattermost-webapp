// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Subscription, Invoice} from './subscription';
import {Product} from './product';
import {ValueOf} from './utilities';

export type CloudState = {
    subscription?: Subscription;
    products?: Record<string, Product>;
    customer?: CloudCustomer;
    invoices?: Record<string, Invoice>;
    limits: {
        limitsLoaded: boolean;
        limits: Limits;
    };
    errors: {
        subscription?: true;
        products?: true;
        customer?: true;
        invoices?: true;
        limits?: true;
    };
}

export const TypePurchases = {
    firstSelfHostLicensePurchase: 'first_purchase',
    renewalSelfHost: 'renewal_self',
    monthlySubscription: 'monthly_subscription',
    annualSubscription: 'annual_subscription',
} as const;

export type MetadataGatherWireTransferKeys = `${ValueOf<typeof TypePurchases>}_alt_payment_method`

export type CustomerMetadataGatherWireTransfer = Partial<Record<MetadataGatherWireTransferKeys, string>>

// Customer model represents a customer on the system.
export type CloudCustomer = {
    id: string;
    creator_id: string;
    create_at: number;
    email: string;
    name: string;
    num_employees: number;
    contact_first_name: string;
    contact_last_name: string;
    billing_address: Address;
    company_address: Address;
    payment_method: PaymentMethod;
} & CustomerMetadataGatherWireTransfer

// CustomerPatch model represents a customer patch on the system.
export type CloudCustomerPatch = {
    email?: string;
    name?: string;
    num_employees?: number;
    contact_first_name?: string;
    contact_last_name?: string;
} & CustomerMetadataGatherWireTransfer

// Address model represents a customer's address.
export type Address = {
    city: string;
    country: string;
    line1: string;
    line2: string;
    postal_code: string;
    state: string;
}

// PaymentMethod represents methods of payment for a customer.
export type PaymentMethod = {
    type: string;
    last_four: string;
    exp_month: number;
    exp_year: number;
    card_brand: string;
    name: string;
}

export type NotifyAdminRequest = {
    trial_notification: boolean;
    required_plan: string;
    required_feature: string;
}

export type Limits = {
    integrations?: {
        enabled?: number;
    };
    messages?: {
        history?: number;
    };
    files?: {
        total_storage?: number;
    };
    teams?: {
        active?: number;
    };
    boards?: {
        cards?: number;
        views?: number;
    };
}

export interface CloudUsage {
    files: {
        totalStorage: number;
        totalStorageLoaded: boolean;
    };
    messages: {
        history: number;
        historyLoaded: boolean;
    };
    boards: {
        cards: number;
        cardsLoaded: boolean;
    };
    teams: TeamsUsage;
    integrations: IntegrationsUsage;
}

export interface IntegrationsUsage {
    enabled: number;
    enabledLoaded: boolean;
}

export type TeamsUsage = {
    active: number;
    cloudArchived: number;
    teamsLoaded: boolean;
}

export type ValidBusinessEmail = {
    is_valid: boolean;
}
