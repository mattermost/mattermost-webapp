// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function uiGetToolTip(text: string): ChainableT<void> {
    cy.findByRole('tooltip').should('contain', text);
    return;
}
Cypress.Commands.add('uiGetToolTip', uiGetToolTip);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Get tooltip
             *
             * @param {string} text of the tooltip
             *
             * @example
             *   cy.uiGetToolTip('text');
             */
            uiGetToolTip(text: string): Chainable;
        }
    }
}
