// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type Subscription = {
    id: string;
    customer_id: string;
    product_id: string;
    add_ons: string[];
    start_at: number;
    end_at: number;
    create_at: number;
    seats: number;
    last_invoice?: Invoice;
    trial_end_at: number;
    is_free_trial: string;
    delinquent_since?: number;
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