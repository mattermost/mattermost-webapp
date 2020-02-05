// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';
import user_roles from '../fixtures/saml_user_roles.json';

Cypress.Commands.add('checkLoginPage', (settings = {}) => {
    // * Check that the login section is loaded
    cy.get('#login_section').should('be.visible');

    // * Check the title
    cy.title().should('include', settings.siteName);

    // * Check elements in the body
    cy.get('#login_section').should('be.visible');
    cy.get('#loginId').should('be.visible').and(($loginTextbox) => {
        const placeholder = $loginTextbox[0].placeholder;
        expect(placeholder).to.match(/Email/);
        expect(placeholder).to.match(/Username/);
    });
    cy.get('#loginPassword').should('be.visible').and('have.attr', 'placeholder', 'Password');
    cy.get('#loginButton').should('be.visible').and('contain', 'Sign in');
});

Cypress.Commands.add('checkSignUpPageSection', () => {
    cy.get('.signup__content').should('be.visible').and('contain', 'Your guest account has no channels assigned. Please contact an administrator.');
});

Cypress.Commands.add('checkChatSideBar', (settings = {}) => {
    if(settings.teamName !== undefined && settings.teamName.length > 0) {
        cy.get('#headerTeamName').should('be.visible').and('contain', settings.teamName);
    }

    if(settings.user.username.length > 0) {
        cy.get('#headerUsername').should('be.visible').and('contain', settings.user.username);
    }

    if(settings.user.userType === "Admin") {
        //check that he is an admin
        cy.get('#sidebarHeaderDropdownButton').click().then(() => {
            //check that he is an admin
            cy.get('#systemConsole').should('be.visible');
            //return to original state
            cy.get('#sidebarHeaderDropdownButton').click();
        });
    }
    cy.get('#channel_view').should('be.visible');
});

Cypress.Commands.add('checkInvitePeoplePage', (settings = {}) => {
    cy.findByTestId('invitationModal').should('be.visible');
    cy.get('#invitation_modal_title').should('be.visible');

    if(settings.teamName !== undefined && settings.teamName.length > 0) {
        cy.get('#invitation_modal_title').and('contain', settings.teamName);
    }

    //TODO - check that it is a modal on top of login page!
    cy.findByTestId('shareLinkInputButton').should('be.visible').and('have.text', 'Copy Link');
});

Cypress.Commands.add('checkCreateTeamPage', (settings = {}) => {
    if(settings.user.userType === "Guest") {
        cy.get('#createNewTeamLink').should('not.be.visible');
    }
    else {
        cy.get('#createNewTeamLink').should('be.visible');
    }
});

Cypress.Commands.add('doSamlLogin', (settings = {}) => {
    // # Go to login page
    cy.apiLogout();
    cy.visit('/login');
    cy.checkLoginPage(settings);

    //click the login button
    cy.get('#login_section').find('a').last().should('contain', settings.loginButtonText).click().wait(TIMEOUTS.SMALL);
});

Cypress.Commands.add('doSamlLogout', (settings = {}) => {
    cy.checkChatSideBar(settings);
    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
        cy.get('#logout').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
            cy.checkLoginPage(settings);
        });
    });
});

Cypress.Commands.add('doSamlLogoutFromSignUp',() => {
    cy.checkSignUpPageSection();
    cy.get('#logout').should('be.visible').click();
});

Cypress.Commands.add('skipOrCreateTeam', (settings, userId) => {
    let teamName = '';

    cy.get('body').then((body) => {
        if (body.text().includes('Create a team')) {
            cy.checkCreateTeamPage(settings);

            teamName = 't' + userId.substring(0, 14);
            cy.get('#createNewTeamLink').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
                cy.get('input[id="teamNameInput"]').should('be.visible').type(teamName, {force: true}).wait(TIMEOUTS.TINY).then(() => {
                    cy.get('#teamNameNextButton').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
                        cy.get('#teamURLFinishButton').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
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
    cy.checkChatSideBar(settings);
    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
        cy.get('#invitePeople').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
            cy.checkInvitePeoplePage();
            cy.findByTestId('shareLinkInput').should('be.visible').invoke('val').then((text) => {
                //close the invitepeople page
                cy.get('.close-x').should('be.visible').click();
                return cy.wrap(text);
            });
        });
    });
});

