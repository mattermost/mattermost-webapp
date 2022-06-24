// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function uiGetToolTip(text: string) {
    cy.findByRole('tooltip').should('contain', text);
}
Cypress.Commands.add('uiGetToolTip', uiGetToolTip);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
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
            uiGetToolTip(text: string): ChainableT<void>;
        }
    }
}
