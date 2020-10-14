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

    before(() => {
        // # Login, create incoming webhook for Team A
        cy.apiInitSetup().then(({team}) => {
            teamA = team.name;
        });
    });

    it('MM-T569 Integrations Page', () => {
        // # Visit the integrations page
        cy.visit(`/${teamA}/integrations`);

        // # Shrink the page
        cy.viewport(500, 500);

        // * Assert left side bar integrations link is visible and works
        cy.get('.backstage-sidebar__category > .category-title').should('be.visible').and('have.attr', 'href', `/${teamA}/integrations`).click()
        cy.url().should('include','/integrations');

        // * Assert left side bar incoming webhooks link is visible and works
        cy.get('#incomingWebhooks > .section-title').should('be.visible').and('have.attr', 'href', `/${teamA}/integrations/incoming_webhooks`).click();
        cy.url().should('include','/incoming_webhooks');

        // * Assert left side bar outgoing webhooks link is visible and works
        cy.get('#outgoingWebhooks > .section-title').should('be.visible').and('have.attr', 'href', `/${teamA}/integrations/outgoing_webhooks`).click();
        cy.url().should('include','/outgoing_webhooks');

        // * Assert left side bar slash commands link is visible and works
        cy.get('#slashCommands > .section-title').should('be.visible').and('have.attr', 'href', `/${teamA}/integrations/commands`).click();
        cy.url().should('include','commands');

        // * Assert left side bar bot accounts link is visible and works
        cy.get('#botAccounts > .section-title').should('be.visible').and('have.attr', 'href', `/${teamA}/integrations/bots`).click();
        cy.url().should('include','/bots');

        // # Return to integrations home
        cy.visit(`/${teamA}/integrations`);

        // # Isolate the icon links
        cy.get('.integrations-list.d-flex.flex-wrap').within(() => {

            // * Assert Incoming Webhooks link is visible and works
            cy.findByText('Incoming Webhooks').scrollIntoView().should('be.visible').click();
            cy.url().should('include','/incoming_webhooks');
        });

        // # Return to integrations home
        cy.visit(`/${teamA}/integrations`);

        // * Assert Outgoing Webhooks link is visible and works
        cy.get('.integrations-list.d-flex.flex-wrap').within(() => {
            cy.findByText('Outgoing Webhooks').scrollIntoView().should('be.visible').click();
            cy.url().should('include','/outgoing_webhooks');
        });

         // # Return to integrations home
         cy.visit(`/${teamA}/integrations`);     

        // * Assert Slash Commands link is visible and works
        cy.get('.integrations-list.d-flex.flex-wrap').within(() => {
            cy.findByText('Slash Commands').scrollIntoView().should('be.visible').click();
            cy.url().should('include','/commands');
        });

        // # Return to integrations home
        cy.visit(`/${teamA}/integrations`);

        // * Assert Outgoing Webhooks link is visible and works
        cy.get('.integrations-list.d-flex.flex-wrap').within(() => {
            cy.findByText('Bot Accounts').scrollIntoView().should('be.visible').click();
            cy.url().should('include','/bots');
        });
    })
});

