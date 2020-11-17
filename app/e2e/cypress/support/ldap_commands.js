// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

Cypress.Commands.add('doLDAPExistingLogin', () => {
    cy.findByText('Click here to sign in.').should('be.visible').click();
});

Cypress.Commands.add('doLDAPLogin', (settings = {}, useEmail = false) => {
    // # Go to login page
    cy.apiLogout();
    cy.visit('/login');
    cy.checkLoginPage(settings);
    cy.performLDAPLogin(settings, useEmail);
});

Cypress.Commands.add('performLDAPLogin', (settings = {}, useEmail = false) => {
    const loginId = useEmail ? settings.user.email : settings.user.username;
    cy.get('#loginId').type(loginId);
    cy.get('#loginPassword').type(settings.user.password);

    //click the login button
    cy.findByText('Sign in').should('be.visible').click();
});

Cypress.Commands.add('doGuestLogout', (settings = {}) => {
    cy.wait(TIMEOUTS.FIVE_SEC);
    cy.get('body').then((body) => {
        if (body.text().includes('Logout')) {
            cy.doLogoutFromSignUp();
        } else {
            cy.doLDAPLogout(settings);
        }
    });
});

Cypress.Commands.add('doMemberLogout', (settings = {}) => {
    cy.wait(TIMEOUTS.FIVE_SEC);
    cy.get('body').then((body) => {
        if (body.text().includes('Logout')) {
            cy.doMemberLogoutFromSignUp();
        } else {
            cy.doLDAPLogout(settings);
        }
    });
});

Cypress.Commands.add('doLDAPLogout', (settings = {}) => {
    cy.checkLeftSideBar(settings);

    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
        cy.findByText('Log Out').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
            cy.checkLoginPage(settings);
        });
    });
});

Cypress.Commands.add('doInviteGuest', (user, settings = {}) => {
    cy.checkLeftSideBar(settings);

    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
        cy.findByText('Invite People').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
            cy.checkInvitePeopleAdminPage();

            cy.findByText('Guests').click();

            cy.findByText('Invite Guests').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
                // # Search and add a user
                cy.findByTestId('emailPlaceholder').should('be.visible').within(() => {
                    cy.get('input').type(user.username, {force: true}).wait(TIMEOUTS.HALF_SEC).type('\n');
                });
                cy.findByTestId('channelPlaceholder').should('be.visible').within(() => {
                    cy.get('input').type('town', {force: true}).wait(TIMEOUTS.HALF_SEC).type('\n');
                });
            });
            cy.findByText('Invite Guests').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
                cy.findByText('Successful Invites').scrollIntoView().should('be.visible').then(() => {
                    cy.findByText('Done').scrollIntoView().should('be.visible').click();
                });
            });
        });
    });
});

Cypress.Commands.add('doInviteMember', (user, settings = {}) => {
    cy.checkLeftSideBar(settings);

    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
        cy.findByText('Invite People').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
            cy.checkInvitePeopleAdminPage();

            cy.findByText('Members').click();

            cy.findByText('Invite Members').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
                // # Search and add a user
                cy.findByTestId('inputPlaceholder').should('be.visible').within(() => {
                    cy.get('input').type(user.username, {force: true}).wait(TIMEOUTS.HALF_SEC).type('\n');
                });
            });

            cy.findByText('Invite Members').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
                cy.findByText('Invite More People').scrollIntoView().should('be.visible').then(() => {
                    cy.findByText('Done').scrollIntoView().should('be.visible').click();
                });
            });
        });
    });
});

Cypress.Commands.add('doSkipTutorial', () => {
    cy.wait(TIMEOUTS.FIVE_SEC);
    cy.get('body').then((body) => {
        if (body.find('#tutorialSkipLink').length > 0) {
            cy.get('#tutorialSkipLink').click().wait(TIMEOUTS.HALF_SEC);
        }
    });
});
