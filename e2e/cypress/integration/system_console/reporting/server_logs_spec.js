// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('System Console > Server Logs', () => {
    before(() => {
        // # Visit the system console.
        cy.visit('/admin_console');

        // # Go to the Server Logs section.
        cy.get('#reporting\\/server_logs').click().wait(TIMEOUTS.TWO_SEC);
    });

    it('MM-T906 Logs - Verify content categories', () => {
        // * Verify the banner is showed.
        cy.get('.banner__content span').should('not.empty');

        // * Verify reload button is showed.
        cy.get('.admin-logs-content button span').should('be.visible').and('contain', 'Reload');

        // * Verify that server logs are showed correctly.
        cy.get('.admin-logs-content div.log__panel').should('be.visible').and('not.empty');
        cy.get('.admin-logs-content div.log__panel span').eq(0).should('not.empty');
    });
});
