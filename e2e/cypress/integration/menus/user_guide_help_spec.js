// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @menu

describe('Main menu', () => {
    let testTeam;
    let testUser;
    let testConfig;

    before(() => {
        cy.apiGetConfig().then((response) => {
            testConfig = response.body;
        });
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
        });
    });

    describe('user help guide', () => {
        it('Should have all the menu items on click', () => {
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/town-square`);
            cy.get('#channel-header').should('be.visible').then(() => {
                cy.get('#channelHeaderUserGuideButton').click();
                cy.get('.dropdown-menu').should('be.visible').then(() => {
                    cy.get('#askTheCommunityLink').should('be.visible');
                    cy.get('#askTheCommunityLink a').should('have.attr', 'href', 'https://mattermost.com/pl/default-ask-mattermost-community/');

                    cy.get('#helpResourcesLink').should('be.visible');
                    cy.get('#helpResourcesLink a').should('have.attr', 'href', testConfig.SupportSettings.HelpLink);

                    cy.get('#reportAProblemLink').should('be.visible');
                    cy.get('#reportAProblemLink a').should('have.attr', 'href', testConfig.SupportSettings.ReportAProblemLink);

                    cy.get('#keyboardShortcuts').should('be.visible');
                    cy.get('#keyboardShortcuts button').click();
                    cy.get('#shortcutsModalLabel').should('be.visible');
                });
            });
        });
    });
});
