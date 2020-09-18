
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @notifications

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Notifications', () => {
    let testTeam;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.apiCreateUser().then(({user}) => {
                otherUser = user;
                cy.apiAddUserToTeam(testTeam.id, otherUser.id);
                cy.apiLogin(otherUser);
            });

            cy.visit(`/${testTeam.name}`);

            // # Open 'Account Settings' modal
            cy.findByLabelText('main menu').should('be.visible').click();
            cy.findByText('Account Settings').should('be.visible').click();

            // * Check that the 'Account Settings' modal was opened
            cy.get('#accountSettingsModal').should('exist').within(() => {
                cy.get('#notificationsButton').should('be.visible').click();
                cy.get('#keysEdit').should('be.visible').click();

                // * Uncheck all the 'Words That Trigger Mentions'
                cy.get('#notificationTriggerFirst').should('not.be.checked');
                cy.get('#notificationTriggerUsername').should('not.be.checked');
                cy.get('#notificationTriggerShouts').should('be.checked').click().then(($shouts) => {
                    cy.get($shouts).should('not.be.checked');
                });
                cy.get('#notificationTriggerCustomText').should('not.be.checked');
                cy.get('#saveSetting').should('be.visible').click();

                // # Close the modal
                cy.get('#accountSettingsHeader').find('button').should('be.visible').click();
            });
            cy.apiLogout();

            // # Login as sysadmin
            cy.apiAdminLogin();
            cy.visit(`/${testTeam.name}`);
        });
    });

    it('MM-T550 Words that trigger mentions - @-icon still shows mentions list if all triggers deselected', () => {
        const text = `${otherUser.username} test message!`;

        // # Type @ in the input box
        cy.focused().type('@');

        // * Make sure that the suggestion list is visible and that otherUser's username is visible
        cy.get('#suggestionList').should('be.visible').within(() => {
            cy.findByText(`@${otherUser.username}`).should('be.visible');
        });

        // # Post the text that was declared earlier and logout from sysadmin account
        cy.focused().type(`${text}{enter}{enter}`);
        cy.apiLogout();

        // # Login as otherUser and visit the team
        cy.apiLogin(otherUser);
        cy.visit(`${testTeam.name}`);

        // # Click on the @ button
        cy.get('#channelHeaderMentionButton', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').click();

        // * Ensure that the user's name is in the search box after clicking on the @ button
        cy.get('#searchBox').should('be.visible').and('have.value', `@${otherUser.username} `);
        cy.get('#search-items-container').should('be.visible').within(() => {
            // * Ensure that the mentions are visible in the RHS
            cy.findByText(`@${otherUser.username}`).should('be.visible');
            cy.findByText('test message!').should('be.visible');
        });
    });
});

