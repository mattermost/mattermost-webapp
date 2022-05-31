// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type CloudState = {
    subscription?: Subscription;
    products?: Record<string, Product>;
    customer?: CloudCustomer;
    invoices?: Record<string, Invoice>;
    limits: {
        limitsLoaded: boolean;
        limits: Limits;
    };
}

export type Subscription = {
    id: string;
    customer_id: string;
    product_id: string;
    add_ons: string[];
    start_at: number;
    end_at: number;
    create_at: number;
    seats: number;
    is_paid_tier: string;
    last_invoice?: Invoice;
    trial_end_at: number;
    is_free_trial: string;
}

export type Product = {
    id: string;
    name: string;
    description: string;
    price_per_seat: number;
    add_ons: AddOn[];
    product_family: string;
    sku: string;
    billing_scheme: string;
    recurring_interval: string;
};

export type AddOn = {
    id: string;
    name: string;
    display_name: string;
    price_per_seat: number;
};

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
}

// CustomerPatch model represents a customer patch on the system.
export type CloudCustomerPatch = {
    email?: string;
    name?: string;
    num_employees?: number;
    contact_first_name?: string;
    contact_last_name?: string;
}

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

// Invoice model represents a invoice on the system.
export type Invoice = {
    id: string;
    number: string;
    create_at: number;
    total: number;
    tax: number;
    status: string;
    description: string;
    period_start: number;
    period_end: number;
    subscription_id: string;
    line_items: InvoiceLineItem[];
    current_product_name: string;
}

// actual string values come from customer-web-server and should be kept in sync with values seen there
export const InvoiceLineItemType = {
    Full: 'full',
    Partial: 'partial',
    OnPremise: 'onpremise',
    Metered: 'metered',
} as const;

// InvoiceLineItem model represents a invoice lineitem tied to an invoice.
export type InvoiceLineItem = {
    price_id: string;
    total: number;
    quantity: number;
    price_per_unit: number;
    description: string;
    type: typeof InvoiceLineItemType[keyof typeof InvoiceLineItemType];
    metadata: Record<string, string>;
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
