// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

// Cypress.Commands.add('checkLoginPage', (settings = {}) => {
//     // * Check the title
//     cy.title().should('include', settings.siteName);

//     // * Check elements in the body
//     cy.get('#loginId').should('be.visible').and(($loginTextbox) => {
//         const placeholder = $loginTextbox[0].placeholder;
//         expect(placeholder).to.match(/Email/);
//         expect(placeholder).to.match(/Username/);
//     });
//     cy.get('#loginPassword').should('be.visible').and('have.attr', 'placeholder', 'Password');
//     cy.findByText('Sign in').should('be.visible');
// });

// Cypress.Commands.add('checkSignUpPageSection', () => {
//     cy.findByText('Your guest account has no channels assigned. Please contact an administrator.').should('be.visible');
// });

// Cypress.Commands.add('checkInvitePeoplePage', (settings = {}) => {
//     if (settings.teamName != null && settings.teamName.length > 0) {
//         cy.findByText('Invite people to ' + settings.teamName).should('be.visible');
//     }
//     cy.findByText('Copy Link').should('be.visible');
// });

Cypress.Commands.add('checkCreateTeamPage', (settings = {}) => {
    if (settings.user.userType === 'Guest' || settings.user.isGuest) {
        cy.findByText('Create a team').scrollIntoView().should('not.be.visible');
    } else {
        cy.findByText('Create a team').scrollIntoView().should('be.visible');
    }
});

Cypress.Commands.add('doSamlLogin', (settings = {}) => {
    // # Go to login page
    cy.apiLogout();
    cy.visit('/login');
    cy.checkLoginPage(settings);

    //click the login button
    cy.findByText(settings.loginButtonText).should('be.visible').click().wait(TIMEOUTS.SMALL);
});

Cypress.Commands.add('doSamlLogout', (settings = {}) => {
    cy.checklLeftSideBar(settings);

    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
        cy.findByText('Log Out').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
            cy.checkLoginPage(settings);
        });
    });
});

Cypress.Commands.add('getInvitePeopleLink', (settings = {}) => {
    cy.checklLeftSideBar(settings);

    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
        cy.findByText('Invite People').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
            cy.checkInvitePeoplePage();
            cy.findByTestId('shareLinkInput').should('be.visible').invoke('val').then((text) => {
                //close the invitepeople modal
                cy.get('.close-x').should('be.visible').click();
                return cy.wrap(text);
            });
        });
    });
});

Cypress.Commands.add('setTestSettings', (loginButtonText, config) => {
    return {
        loginButtonText,
        siteName: config.TeamSettings.SiteName,
        siteUrl: config.ServiceSettings.SiteURL,
        teamName: '',
        user: null
    };
});

