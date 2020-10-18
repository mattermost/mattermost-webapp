// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

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
    cy.findByText(settings.loginButtonText).should('be.visible').click().wait(TIMEOUTS.FIVE_SEC);
});

Cypress.Commands.add('doSamlLogout', (settings = {}) => {
    cy.checkLeftSideBar(settings);

    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
        cy.findByText('Log Out').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
            cy.checkLoginPage(settings);
        });
    });
});

Cypress.Commands.add('getInvitePeopleLink', (settings = {}) => {
    cy.checkLeftSideBar(settings);

    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
        cy.findByText('Invite People').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC).then(() => {
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
        user: null,
    };
});
