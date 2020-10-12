// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Integrations', () => {
    let testTeam;
    const httpUrl = 'http://testurl.mm';
    const httpsUrl = 'https//testurl.mm';
    const badUrl = 'testurl.mm';

    before(() => {
        // # Login then visit the integrations slash commands add page
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${team.name}/integrations/commands/add`);
        });
    });

    it('MM-T702 Edit to invalid URL', () => {
        // # Setup slash command with HTTP url
        cy.get('#displayName', {timeout: TIMEOUTS.ONE_MIN}).type('Missing Protocol Test');
        cy.get('#trigger').type('trigger');
        cy.get('#url').type(httpUrl);
        cy.get('#saveCommand').click();
        cy.get('#formTitle').contains('Setup Successful');

        // # Return to slash command and edit url to exclude HTTP
        cy.visit(`/${testTeam.name}/integrations/commands/installed`);
        cy.findByText('Edit', {timeout: TIMEOUTS.ONE_MIN}).click();
        cy.get('#url').clear().type(badUrl);
        cy.get('#saveCommand').click();

        // * Warning message appears on clicking Update
        cy.get('#confirmModalBody').contains('Your changes may break the existing slash command. Are you sure you would like to update it?');
        cy.get('#confirmModalButton').click();

        // * Error message appears after clicking modal Update button
        cy.findByText('Invalid URL', {exact: false}).should('be.visible').contains('Invalid URL. Must be a valid URL and start with http:// or https://.');

        // * Error message removed when valid HTTPS URL entered and saved
        cy.get('#url').clear().type(httpsUrl);
        cy.get('#saveCommand').click();
        cy.findByText('Invalid URL', {exact: false}).should('not.be', 'visible');

        // # Return to slash command and edit url to exclude HTTPS
        cy.visit(`/${testTeam.name}/integrations/commands/installed`);
        cy.findByText('Edit', {timeout: TIMEOUTS.ONE_MIN}).click();
        cy.get('#url').clear().type(badUrl);
        cy.get('#saveCommand').click();

        // * Warning message appears on clicking Update
        cy.get('#confirmModalBody').contains('Your changes may break the existing slash command. Are you sure you would like to update it?');
        cy.get('#confirmModalButton').click();

        // * Error message appears after clicking modal Update button
        cy.findByText('Invalid URL', {exact: false}).should('be.visible').contains('Invalid URL. Must be a valid URL and start with http:// or https://.');

        // * Error message removed when correct URL entered and saved
        cy.get('#url').clear().type(httpUrl);
        cy.get('#saveCommand').click();
        cy.findByText('Invalid URL', {exact: false}).should('not.be', 'visible');
    });
});
