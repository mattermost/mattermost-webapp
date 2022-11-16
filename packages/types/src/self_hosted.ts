// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Product} from './product';
import {Subscription} from './subscription';

export type SelfHostedState = {
    subscription?: Subscription;
    products?: Record<string, Product>;
    // customer?: CloudCustomer;
    // invoices?: Record<string, Invoice>;
    // limits: {
        // limitsLoaded: boolean;
        // limits: Limits;
    // };
    errors: {
        subscription?: true;
        products?: true;
        customer?: true;
        invoices?: true;
        limits?: true;
    };
}
