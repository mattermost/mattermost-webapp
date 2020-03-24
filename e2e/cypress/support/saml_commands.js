// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

Cypress.Commands.add('checkLoginPage', (settings = {}) => {
    // * Check the title
    cy.title().should('include', settings.siteName);

    // * Check elements in the body
    cy.get('#loginId').should('be.visible').and(($loginTextbox) => {
        const placeholder = $loginTextbox[0].placeholder;
        expect(placeholder).to.match(/Email/);
        expect(placeholder).to.match(/Username/);
    });
    cy.get('#loginPassword').should('be.visible').and('have.attr', 'placeholder', 'Password');
    cy.findByText('Sign in').should('be.visible');
});

Cypress.Commands.add('checkSignUpPageSection', () => {
    cy.findByText('Your guest account has no channels assigned. Please contact an administrator.').should('be.visible');
});

Cypress.Commands.add('checklLeftSideBar', (settings = {}) => {
    if (settings.teamName != null && settings.teamName.length > 0) {
        cy.get('#headerTeamName').should('be.visible').and('contain', settings.teamName);
    }

    if (settings.user.username.length > 0) {
        cy.get('#headerUsername').should('be.visible').and('contain', settings.user.username);
    }

    if (settings.user.userType === 'Admin' || settings.user.isAdmin) {
        //check that he is an admin
        cy.get('#sidebarHeaderDropdownButton').click().then(() => {
            cy.findByText('System Console').should('be.visible');
            cy.get('#sidebarHeaderDropdownButton').click();
        });
    } else {
        cy.get('#sidebarHeaderDropdownButton').click().then(() => {
            cy.findByText('System Console').should('not.be.visible');
            cy.get('#sidebarHeaderDropdownButton').click();
        });
    }
    cy.get('#channel_view').should('be.visible');
});

Cypress.Commands.add('checkInvitePeoplePage', (settings = {}) => {
    if (settings.teamName != null && settings.teamName.length > 0) {
        cy.findByText('Invite people to ' + settings.teamName).should('be.visible');
    }
    cy.findByText('Copy Link').should('be.visible');
});

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

Cypress.Commands.add('doSamlLogoutFromSignUp', () => {
    cy.checkSignUpPageSection();
    cy.findByText('Logout').should('be.visible').click();
});

Cypress.Commands.add('skipOrCreateTeam', (settings, userId) => {
    let teamName = '';

    cy.get('body').then((body) => {
        if (body.text().includes('Create a team')) {
            cy.checkCreateTeamPage(settings);

            teamName = 't' + userId.substring(0, 14);
            cy.findByText('Create a team').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
                cy.get('input[id="teamNameInput"]').should('be.visible').type(teamName, {force: true}).wait(TIMEOUTS.TINY).then(() => {
                    cy.findByText('Next').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
                        cy.findByText('Finish').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
                            settings.teamName = teamName;
                        });
                    });
                });
            });
        }
        settings.teamName = teamName;
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

