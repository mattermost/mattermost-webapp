// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

import {getRandomId} from '../../utils';

describe('Integrations', () => {
    let teamName;
    const results = 'Test';
    const noResults = `${getRandomId(10)}`;

    before(() => {
        // # Setup with the new team and channel
        cy.apiInitSetup().then(({team, channel}) => {
            teamName = team.name;

            // # Setup 2 incoming webhooks
            const newIncomingHook1 = {
                channel_id: channel.id,
                description: 'Incoming webhook Test Description One',
                display_name: 'Test 1',
            };
            cy.apiCreateWebhook(newIncomingHook1);

            const newIncomingHook2 = {
                channel_id: channel.id,
                description: 'Incoming webhook Test Description Two',
                display_name: 'Test 2',
            };
            cy.apiCreateWebhook(newIncomingHook2);

            // # Setup 2 outgoing webhooks
            const newOutgoingHook1 = {
                team_id: team.id,
                display_name: 'Test 1',
                trigger_words: ['banana'],
                callback_urls: ['https://mattermost.com'],
            };
            cy.apiCreateWebhook(newOutgoingHook1, false);
            const newOutgoingHook2 = {
                team_id: team.id,
                display_name: 'Test 2',
                trigger_words: ['apple'],
                callback_urls: ['https://mattermost.com'],
            };
            cy.apiCreateWebhook(newOutgoingHook2, false);

            // # Setup 2 Slash Commands
            const slashCommand1 = {
                description: 'Test Slash Command 1',
                display_name: 'Test 1',
                method: 'P',
                team_id: team.id,
                trigger: 'search-test',
                url: 'https://google.com',
            };
            cy.apiCreateCommand(slashCommand1);
            const slashCommand2 = {
                description: 'Test Slash Command 2',
                display_name: 'Test 2',
                method: 'P',
                team_id: team.id,
                trigger: 'search-testsfds',
                url: 'https://google.com',
            };
            cy.apiCreateCommand(slashCommand2);

            // # Setup 2 bot accounts
            const botName1 = `${getRandomId(6)}`;
            const botName2 = `${getRandomId(6)}`;
            cy.visit(`/${teamName}/integrations/bots/add`);
            cy.get('#username').type(`Test1-${botName1}`);
            cy.get('#saveBot').click();
            cy.get('#doneButton').click();
            cy.visit(`/${teamName}/integrations/bots/add`);
            cy.get('#username').type(`Test2-${botName2}`);
            cy.get('#saveBot').click();
            cy.get('#doneButton').click();
        });
    });

    it('MM-T571 Integration search gives feed back when there are no results', () => {
        // # Visit the integrations page
        cy.visit(`/${teamName}/integrations`);

        // # Shrink the page
        cy.viewport(300, 500);

        // * Check incoming webhooks for no match message
        cy.get('#incomingWebhooks').click();
        cy.get('#searchInput').type(results).then(() => {
            cy.get('#emptySearchResultsMessage').should('not.exist');
        });
        cy.get('#searchInput').clear().type(noResults);
        cy.get('#emptySearchResultsMessage').contains(`No incoming webhooks match ${noResults}`);

        // * Check outgoing webhooks for no match message
        cy.get('#outgoingWebhooks').click();
        cy.get('#searchInput').type(results).then(() => {
            cy.get('#emptySearchResultsMessage').should('not.exist');
        });
        cy.get('#searchInput').clear().type(noResults);
        cy.get('#emptySearchResultsMessage').contains(`No outgoing webhooks match ${noResults}`);

        // * Check slash commands for no match message
        cy.get('#slashCommands').click();
        cy.get('#searchInput').type(results).then(() => {
            cy.get('#emptySearchResultsMessage').should('not.exist');
        });
        cy.get('#searchInput').clear().type(noResults);
        cy.get('#emptySearchResultsMessage').contains(`No commands match ${noResults}`);

        // * Check bot accounts for no match message
        cy.get('#botAccounts').click();
        cy.get('#searchInput').type(results).then(() => {
            cy.get('#emptySearchResultsMessage').should('not.exist');
        });
        cy.get('#searchInput').clear().type(noResults);
        cy.get('#emptySearchResultsMessage').contains(`No bot accounts match ${noResults}`);
    });
});
