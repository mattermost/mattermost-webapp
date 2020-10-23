// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

describe('Integrations', () => {
    let teamA;
    const searchterm = 'abcde'

    before(() => {
        // # Setup with the new team
        cy.apiInitSetup().then(({team}) => {
            teamA = team.name;
        });
    });

    it('MM-T569 Integrations Page', () => {
        // # Visit the integrations page
        cy.visit(`/${teamA}/integrations`);

        // # Shrink the page
        cy.viewport(300, 500);

        // * Check incoming webhooks for no match message
        cy.get('#incomingWebhooks > .section-title').click();
        cy.get('#searchInput').type(searchterm);
        cy.get('#emptySearchResultsMessage').contains(`No incoming webhooks match ${searchterm}`);
        
        // * Check outgoing webhooks for no match message
        cy.get('.category-title').click();
        cy.get('#outgoingWebhooks > .section-title').click();
        cy.get('#searchInput').clear().type(searchterm);
        cy.get('#emptySearchResultsMessage').contains(`No outgoing webhooks match ${searchterm}`);

        // * Check slash commands for no match message
        cy.get('.category-title').click();
        cy.get('#slashCommands > .section-title').click();
        cy.get('#searchInput').clear().type(searchterm);
        cy.get('#emptySearchResultsMessage').contains(`No commands match ${searchterm}`);

        // * Check bot accounts for no match message
        cy.get('.category-title').click();
        cy.get('#botAccounts > .section-title').click();
        cy.get('#searchInput').clear().type(searchterm);
        cy.get('#emptySearchResultsMessage').contains(`No bot accounts match ${searchterm}`);
        });
    });
