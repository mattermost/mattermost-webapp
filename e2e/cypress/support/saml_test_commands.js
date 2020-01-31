// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';
import user_roles from '../fixtures/saml_user_roles.json';

Cypress.Commands.add('doSamlLogin', (testParams = {}) => {
    // # Go to login page
    cy.apiLogout();
    cy.visit('/login');

    // * Check that the login section is loaded
    cy.get('#login_section').should('be.visible');

    // * Check the title
    cy.title().should('include', testParams.siteUrl);

    // * Check elements in the body
    cy.get('#login_section').should('be.visible');
    cy.get('#site_name').should('contain', testParams.siteUrl);
    cy.get('#site_description').should('contain', 'All team communication in one place, searchable and accessible anywhere');
    cy.get('#loginId').
        should('be.visible').
        and(($loginTextbox) => {
            const placeholder = $loginTextbox[0].placeholder;
            expect(placeholder).to.match(/Email/);
            expect(placeholder).to.match(/Username/);
        });
    cy.get('#loginPassword').
        should('be.visible').
        and('have.attr', 'placeholder', 'Password');
    cy.get('#loginButton').
        should('be.visible').
        and('contain', 'Sign in');
    cy.get('#login_forgot').should('contain', 'I forgot my password');

    // # Click "Sign in" button
    // Should add id to anchor tag, so we can retreive via id instead of .find().last()
    // TODO: Update control to have id, then select by id here.
    cy.get('#login_section').find('a').last().should('contain', testParams.buttonText).click().wait(TIMEOUTS.SMALL);
});

Cypress.Commands.add('doSamlLogout', () => {
    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').click().wait(TIMEOUTS.TINY).then(() => {
        cy.get('#logout').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
            // * Check that it logout successfully and it redirects into the login page
            cy.get('#login_section').should('be.visible');
            cy.location('pathname').should('contain', '/login');
        });
    });
});

Cypress.Commands.add('doCreateTeam', (teamName) => {
    cy.get('body').then((body) => {
        if (body.text().includes('Create a team')) {
            cy.get('#createNewTeamLink').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
                cy.get('input[id="teamNameInput"]').should('exist').type(teamName, {force: true}).wait(TIMEOUTS.TINY).then(() => {
                    cy.get('#teamNameNextButton').should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
                        cy.get('#teamURLFinishButton').should('be.visible').click().wait(TIMEOUTS.TINY);
                    });
                });
            });
        }
    });
});

Cypress.Commands.add('getInvitePeopleLink', () => {
    cy.get('#sidebarHeaderDropdownButton').click().wait(TIMEOUTS.TINY).then(() => {
        cy.get('#invitePeople').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
            cy.findByTestId('shareLinkInputButton').should('be.visible').and('have.text', 'Copy Link');
            cy.findByTestId('shareLinkInput').invoke('val').then((text) => {
                return text;
            });
        });
    });
});

Cypress.Commands.add('setUserRole', (configSamlSettings, role) => {
    configSamlSettings.SamlSettings.GuestAttribute = "";
    configSamlSettings.SamlSettings.AdminAttribute = "";

    switch(role) {
        case user_roles.guest:
            configSamlSettings.SamlSettings.GuestAttribute = "userType='Guest'";
            break;
        case user_roles.admin:
            configSamlSettings.SamlSettings.AdminAttribute = "userType='Admin'";
            break;
        default:
            break;
    }
    console.log('setUserRole ' + 'ga: ' + configSamlSettings.SamlSettings.GuestAttribute + ' aa:' + configSamlSettings.SamlSettings.AdminAttribute);
    cy.apiUpdateConfig(configSamlSettings);
});

