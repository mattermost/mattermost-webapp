// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function uiGetPaymentCardInput(): ChainableT<unknown> {
    return cy.
        get('.__PrivateStripeElement > iframe').
        its('0.contentDocument.body').should('not.be.empty').
        then(cy.wrap);
}
Cypress.Commands.add('uiGetPaymentCardInput', uiGetPaymentCardInput);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Iframe element in Stripe
             *
             * @example
             *   cy.uiGetPaymentCardInput();
             */
            uiGetPaymentCardInput: typeof uiGetPaymentCardInput;
        }
    }
}
