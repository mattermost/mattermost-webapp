// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 5] */

import {getRandomInt} from '../../utils';

describe('Integrations page', () => {
    before(() => {
        // # Login
        cy.apiLogin('sysadmin');

        // # Get current settings
        cy.request('/api/v4/config').then((response) => {
            const settings = response.body;

            // # Modify the settings we need to change
            settings.ServiceSettings.EnableOAuthServiceProvider = true;
            settings.ServiceSettings.EnableIncomingWebhooks = true;
            settings.ServiceSettings.EnableOutgoingWebhooks = true;
            settings.ServiceSettings.EnableCommands = true;

            // # Set the modified settings
            cy.request({
                url: '/api/v4/config',
                headers: {'X-Requested-With': 'XMLHttpRequest'},
                method: 'PUT',
                body: settings,
            });
        });

        // # Go to integrations
        cy.visit('/ad-1/integrations');

        // * Validate that all sections are enabled
        cy.get('#incomingWebhooks').should('be.visible');
        cy.get('#outgoingWebhooks').should('be.visible');
        cy.get('#slashCommands').should('be.visible');
        cy.get('#botAccounts').should('be.visible');
        cy.get('#oauthApps').should('be.visible');
    });

    it('should should display correct message when incoming webhook not found', () => {
        // # Open incoming web hooks page
        cy.get('#incomingWebhooks').click();

        // # Add web 'include', '/newPage'hook
        cy.get('#addIncomingWebhook').click();

        // # Pick the channel
        cy.get('#channelSelect').select('Town Square');

        // # Save
        cy.get('#saveWebhook').click();

        // * Validate that save succeeded
        cy.get('#formTitle').should('have.text', 'Setup Successful');

        // # Close the Add dialog
        cy.get('#doneButton').click();

        // # Type random stuff into the search box
        const searchString = `some random stuff ${Date.now()}`;
        cy.get('#searchInput').type(`${searchString}{enter}`);

        // * Validate that the correct empty message is shown
        cy.get('#emptySearchResultsMessage').should('be.visible').and('have.text', `No incoming webhooks match ${searchString}`);
    });

    it('should should display correct message when outgoing webhook not found', () => {
        // # Open outgoing web hooks page
        cy.get('#outgoingWebhooks').click();

        // # Add web hook
        cy.get('#addOutgoingWebhook').click();

        // # Pick the channel and dummy callback
        cy.get('#channelSelect').select('Town Square');
        cy.get('#callbackUrls').type('https://dummy');

        // # Save
        cy.get('#saveWebhook').click();

        // * Validate that save succeeded
        cy.get('#formTitle').should('have.text', 'Setup Successful');

        // # Close the Add dialog
        cy.get('#doneButton').click();

        // # Type random stuff into the search box
        const searchString = `some random stuff ${Date.now()}`;
        cy.get('#searchInput').type(`${searchString}{enter}`);

        // * Validate that the correct empty message is shown
        cy.get('#emptySearchResultsMessage').should('be.visible').and('have.text', `No outgoing webhooks match ${searchString}`);
    });

    it('should should display correct message when slash command not found', () => {
        // # Open slash command page
        cy.get('#slashCommands').click();

        // # Add new command
        cy.get('#addSlashCommand').click();

        // # Pick a dummy trigger and callback
        cy.get('#trigger').type(`test-trigger${getRandomInt(10000)}`);
        cy.get('#url').type('https://dummy');

        // # Save
        cy.get('#saveCommand').click();

        // * Validate that save succeeded
        cy.get('#formTitle').should('have.text', 'Setup Successful');

        // # Close the Add dialog
        cy.get('#doneButton').click();

        // # Type random stuff into the search box
        const searchString = `some random stuff ${Date.now()}`;
        cy.get('#searchInput').type(`${searchString}{enter}`);

        // * Validate that the correct empty message is shown
        cy.get('#emptySearchResultsMessage').should('be.visible').and('have.text', `No commands match ${searchString}`);
    });

    it('should should display correct message when OAuth app not found', () => {
        // # Open OAuth apps page
        cy.get('#oauthApps').click();

        // # Add new command
        cy.get('#addOauthApp').click();

        // # Fill in dummy details
        cy.get('#name').type(`test-name${getRandomInt(10000)}`);
        cy.get('#description').type(`test-descr${getRandomInt(10000)}`);
        cy.get('#homepage').type(`https://dummy${getRandomInt(10000)}`);
        cy.get('#callbackUrls').type('https://dummy');

        // # Save
        cy.get('#saveOauthApp').click();

        // * Validate that save succeeded
        cy.get('#formTitle').should('have.text', 'Setup Successful');

        // # Close the Add dialog
        cy.get('#doneButton').click();

        // # Type random stuff into the search box
        const searchString = `some random stuff ${Date.now()}`;
        cy.get('#searchInput').type(`${searchString}{enter}`);

        // * Validate that the correct empty message is shown
        cy.get('#emptySearchResultsMessage').should('be.visible').and('have.text', `No OAuth 2.0 Applications match ${searchString}`);
    });

    it('should should display correct message when bot account not found', () => {
        // # Open  bot account page
        cy.get('#botAccounts').click();

        // # Add new bot
        cy.get('#addBotAccount').click();

        // # Fill in dummy details
        cy.get('#username').type(`test-bot${getRandomInt(10000)}`);

        // # Save
        cy.get('#saveBot').click();

        // * Make sure we are done saving
        cy.url().should('contain', '/integrations/bots');

        // # Type random stuff into the search box
        const searchString = `some random stuff ${Date.now()}`;
        cy.get('#searchInput').type(`${searchString}{enter}`);

        // * Validate that the correct empty message is shown
        cy.get('#emptySearchResultsMessage').should('be.visible').and('have.text', `No bot accounts match ${searchString}`);
    });
});
