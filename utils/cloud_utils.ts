// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CloudCustomer} from 'mattermost-redux/types/cloud';

export function isCustomerCardExpired(customer?: CloudCustomer): boolean {
    if (!customer) {
        return false;
    }

    // Will developers ever learn? :D
    const expiryYear = customer.payment_method.exp_year + 2000;

    // This works because we store the expiry month as the actual 1-12 base month, but Date uses a 0-11 base month
    // But credit cards expire at the end of their expiry month, so we can just use that number.
    const lastExpiryDate = new Date(expiryYear, customer.payment_method.exp_month, 1);
    return lastExpiryDate <= new Date();
}
