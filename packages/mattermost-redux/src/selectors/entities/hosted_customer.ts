// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SelfHostedSignupProgress, HostedCustomerState} from '@mattermost/types/hosted_customer';
import {ValueOf} from '@mattermost/types/utilities';
import {GlobalState} from '@mattermost/types/store';
import {Invoice, Product} from '@mattermost/types/cloud';

export function getSelfHostedSignupProgress(state: GlobalState): ValueOf<typeof SelfHostedSignupProgress> {
    return state.entities.hostedCustomer.signupProgress;
}

export function getSelfHostedProducts(state: GlobalState): Record<string, Product> {
    return state.entities.hostedCustomer.products.products;
}

export function getSelfHostedProductsLoaded(state: GlobalState): boolean {
    return state.entities.hostedCustomer.products.productsLoaded;
}

export function getSelfHostedInvoices(state: GlobalState): Record<string, Invoice> {
    return state.entities.hostedCustomer.invoices.invoices;
}

export function getSelfHostedErrors(state: GlobalState): HostedCustomerState['errors'] {
    return state.entities.hostedCustomer.errors;
}
