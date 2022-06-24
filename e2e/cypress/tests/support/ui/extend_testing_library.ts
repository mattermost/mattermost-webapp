// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function findByRoleExtended(role: string, {name}: {name: string}): ChainableT<JQuery> {
    const re = RegExp(name, 'i');
    return cy.findByRole(role, {name: re}).should('have.text', name);
}
Cypress.Commands.add('findByRoleExtended', findByRoleExtended);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Extends `findByRole` by matching case to `name` as insensitive but sensitive to `text` value
             * @param {string} role - button, input, textbox, etc.
             * @param {Object} option.name - text value of the target element
             *
             * @example
             *   cy.findByRoleExtended('button', {name: 'Advanced'}).should('be.visible').click();
             */
            findByRoleExtended: typeof findByRoleExtended;
        }
    }
}
