// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

/**
* Note: This test requires webhook server running. Initiate `npm run start:webhook` to start.
*/
import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Slash commands page', () => {
    const trigger = 'test-message';
    let testTeam;

    before(() => {
        cy.requireWebhookServer();
    });

    beforeEach(() => {
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            // # Go to integrations
            cy.visit(`/${team.name}/integrations`);

            // * Validate that slash command section is enabled
            cy.get('#slashCommands').should('be.visible');

            // # Open slash command page
            cy.get('#slashCommands').click();
        });
    });

    it('MM-T690 Add custom slash command: / error', () => {
        // # Add new command
        cy.get('#addSlashCommand').click();

        // # Type a trigger starting with slash
        cy.get('#trigger').type('//input');

        // # Save
        cy.get('#saveCommand').click();

        // * Verify that we get the error message
        cy.findByText('A trigger word cannot begin with a /').should('exist').and('be.visible').scrollIntoView();
    });

    it('MM-T691 Error: trigger word required', () => {
        // # Add new command
        cy.get('#addSlashCommand').click();

        // # Do not input trigger word
        cy.get('#url').type('http://example.com');

        // # Save
        cy.get('#saveCommand').click();

        // * Verify that we get the error message
        cy.findByText('A trigger word is required').should('exist').and('be.visible').scrollIntoView();
    });

    it('MM-T692 Error: no spaces in trigger word', () => {
        // # Add new command
        cy.get('#addSlashCommand').click();

        // # Type a trigger word with space in it
        cy.get('#trigger').type('trigger with space');

        // # Save
        cy.get('#saveCommand').click();

        // * Verify that we get the error message
        cy.findByText('A trigger word must not contain spaces').should('exist').and('be.visible').scrollIntoView();
    });

    it('MM-T693 Error: URL required', () => {
        // # Add new command
        cy.get('#addSlashCommand').click();

        // # Type a trigger word
        cy.get('#trigger').type('test');

        // # Save
        cy.get('#saveCommand').click();

        // * Verify that we get the error message
        cy.findByText('A request URL is required').should('exist').and('be.visible').scrollIntoView();
    });

    it('MM-T694 Error: trigger word in use', () => {
        // # Add new command
        cy.get('#addSlashCommand').click();

        // # Type a trigger word and URL
        cy.get('#trigger').type('my_trigger_word');
        cy.get('#url').type('http://');

        // # Save
        cy.get('#saveCommand').click();

        // # Go to integrations
        cy.visit(`/${testTeam.name}/integrations`);

        // * Validate that slash command section is enabled
        cy.get('#slashCommands').should('be.visible');

        // # Open slash command page
        cy.get('#slashCommands').click();

        // # Add same command
        cy.get('#addSlashCommand').click();

        // # Type same trigger word and URL
        cy.get('#trigger').type('my_trigger_word');
        cy.get('#url').type('http://');

        // # Save
        cy.get('#saveCommand').click();

        // * Verify that we get the error message
        cy.findByText('This trigger word is already in use. Please choose another word.').should('exist').and('be.visible').scrollIntoView();
    });

    it('MM-T695 Run custom slash command', () => {
        addNewCommand(testTeam, trigger, '');
        runSlashCommand(testTeam, trigger);
    });

    it('MM-T698 Cancel out of edit', () => {
        addNewCommand(testTeam, trigger, 'http://example.com');

        // # Go to integrations
        cy.visit(`/${testTeam.name}/integrations`);

        // # Open slash command page
        cy.get('#slashCommands').click();

        // # Click on edit
        cy.get('a[href*="/edit"]').click();

        // # Change url
        cy.get('#url').clear().type('http://mattermost.com');

        // # Click on Cancel
        cy.get('a').contains('Cancel').click();

        // # Click on edit again
        cy.get('a[href*="/edit"]').click();

        // * Verify that url value is not changed
        cy.get('#url').should('have.value', 'http://example.com');
    });

    it('MM-T699 Edit custom slash command', () => {
        addNewCommand(testTeam, trigger, '');

        // # Go to integrations
        cy.visit(`/${testTeam.name}/integrations`);

        // # Open slash command page
        cy.get('#slashCommands').click();

        // # Click on edit
        cy.get('a[href*="/edit"]').click();

        // # Update display name
        cy.get('#displayName').clear().type('Test Message - Edit');

        // # Update
        cy.get('#saveCommand').click();

        // * Verify successful update
        cy.findByText('Test Message - Edit').should('exist').and('be.visible');

        runSlashCommand(testTeam, trigger);
    });
});

function addNewCommand(team, trigger, url) {
    // # Add new command
    cy.get('#addSlashCommand').click();

    // # Type a trigger word, url and display name
    cy.get('#trigger').type(`${trigger}`);
    cy.get('#displayName').type('Test Message');
    cy.apiGetChannelByName(team.name, 'town-square').then((res) => {
        let urlToType = url;
        if (url === '') {
            urlToType = `${Cypress.env('webhookBaseUrl')}/send_message_to_channel?channel_id=${res.body.id}`;
        }
        cy.get('#url').type(`${urlToType}`);

        // # Save
        cy.get('#saveCommand').click();

        // * Verify we are at setup successful URL
        cy.url().should('include', '/integrations/commands/confirm');

        // * Verify slash was successfully created
        cy.findByText('Setup Successful').should('exist').and('be.visible');

        // * Verify token was created
        cy.findByText('Token').should('exist').and('be.visible');
    });
}

function runSlashCommand(team, trigger) {
    // # Go back to home channel
    cy.visit(`/${team.name}/channels/town-square`);
    cy.wait(TIMEOUTS.TWO_SEC);

    // # Run slash command
    cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').clear().type(`/${trigger}{enter}`);
    cy.wait(TIMEOUTS.TWO_SEC);

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        cy.get(`#post_${postId}`).get('.Badge').contains('BOT');
    });
}
