// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';
import {_} from 'lodash';

Cypress.Commands.add('doSamlLoginClick', (testParams = {}) => {
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

Cypress.Commands.add('doCreateTeam', (teamName) => {
    // cy.wait(TIMEOUTS.SMALL).then(() => {
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
    // });
});

Cypress.Commands.add('generateRandomMMUser', () => {
    const uuid = () => _.random(0, 1e6);
    const id = uuid();
    const testName = Cypress.mocha.getRunner().test.title.toLowerCase().trim().split(' ').join('');
    const name = `${testName}-${id}`;

    console.log('generateRandomMMUser ' + name);

    var user = {
        firstname: name,
        lastname: name,
        email: name + '@test.com',
        login: name + '@test.com',
        password: Cypress.env("saml_test_user_password")
    };

    return user;
});

Cypress.Commands.add('samlLogoutClick', () => {
    // # Click hamburger main menu button
    cy.get('#sidebarHeaderDropdownButton').click().wait(TIMEOUTS.TINY).then(() => {
        cy.get('#logout').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.TINY).then(() => {
            // * Check that it logout successfully and it redirects into the login page
            cy.get('#login_section').should('be.visible');
            cy.location('pathname').should('contain', '/login');
        });
    });
});