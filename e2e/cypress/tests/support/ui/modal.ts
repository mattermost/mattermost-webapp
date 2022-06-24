// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

import * as TIMEOUTS from '../../fixtures/timeouts';

function uiCloseModal(headerLabel: string) {
    // # Close modal with modal label
    cy.get('#genericModalLabel', {timeout: TIMEOUTS.HALF_MIN}).should('have.text', headerLabel).parents().find('.modal-dialog').findByLabelText('Close').click();
}
Cypress.Commands.add('uiCloseModal', uiCloseModal);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Close modal with header label
             * @param {string} headerLabel - the header label
             *
             * @example
             *   const headerLabel = 'What\'s New';
             *   cy.uiCloseModal(headerLabel);
             */
            uiCloseModal(headerLabel: string): ChainableT<void>;
        }
    }
}
