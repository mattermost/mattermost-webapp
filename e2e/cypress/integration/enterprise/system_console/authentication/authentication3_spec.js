// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console @authentication

import * as TIMEOUTS from '../../../../fixtures/timeouts';

import {getEmailUrl, getRandomId} from '../../../../utils';

describe('Authentication Part 3', () => {
    let testUser;
    let testUserAlreadyInTeam;
    let testTeam;

    before(() => {
        cy.apiRequireLicense();

        // # Do email test if setup properly
        cy.apiEmailTest();

        cy.apiInitSetup().then(({user, team}) => {
            testUserAlreadyInTeam = user;
            testTeam = team;
            cy.apiCreateUser().then(({user: newUser}) => {
                testUser = newUser;
            });
        });
    });

    beforeEach(() => {
        // # Log in as a admin.
        cy.apiAdminLogin();
    });

    after(() => {
        // # Log in as a admin.
        cy.apiAdminLogin({failOnStatusCode: false});

        cy.apiUpdateConfig({
            EmailSettings: {
                EnableSignInWithEmail: true,
                EnableSignInWithUsername: true,
            },
        });
    });

    // it('MM-T1767 - Email signin false Username signin true', () => {
    //     cy.apiUpdateConfig({
    //         EmailSettings: {
    //             EnableSignInWithEmail: false,
    //             EnableSignInWithUsername: true,
    //         },
    //         LdapSettings: {
    //             Enable: false
    //         },
    //     });

    //     cy.apiLogout();

    //     // # Go to front page
    //     cy.visit('/login');

    //     // * Make sure input section for username contains username and not email
    //     cy.findByTestId('loginId').invoke('attr', 'placeholder').should('contain', 'Username').and('not.contain', 'Email');
    // });

    // it('MM-T1768 - Email signin true Username signin true', () => {
    //     cy.apiUpdateConfig({
    //         EmailSettings: {
    //             EnableSignInWithEmail: true,
    //             EnableSignInWithUsername: true,
    //         },
    //         LdapSettings: {
    //             Enable: false
    //         },
    //     });

    //     cy.apiLogout();

    //     // # Go to front page
    //     cy.visit('/login');

    //     // * Make sure input section for username contains username and not email
    //     cy.findByTestId('loginId').invoke('attr', 'placeholder').should('contain', 'Username').and('contain', 'Email');
    // });

    // it('MM-T1769 - Email signin true Username signin false', () => {
    //     cy.apiUpdateConfig({
    //         EmailSettings: {
    //             EnableSignInWithEmail: true,
    //             EnableSignInWithUsername: false,
    //         },
    //         LdapSettings: {
    //             Enable: false
    //         },
    //     });

    //     cy.apiLogout();

    //     // # Go to front page
    //     cy.visit('/login');

    //     // * Make sure input section for username contains username and not email
    //     cy.findByTestId('loginId').invoke('attr', 'placeholder').should('contain', 'Email').and('not.contain', 'Username');
    // });

    // it('MM-T1771 - Minimum password length error field shows below 5 and above 64', () => {
    //     cy.visit('/admin_console/authentication/password');

    //     cy.findByPlaceholderText('E.g.: "5"').clear().type('88');

    //     cy.findByText('Save').click();

    //     // * Ensure error appears when saving a password outside of the limits
    //     cy.findByText('Minimum password length must be a whole number greater than or equal to 5 and less than or equal to 64.', {timeout: TIMEOUTS.ONE_MIN})
    //     .should('exist')
    //     .and('be.visible');

    //     cy.findByPlaceholderText('E.g.: "5"').clear().type('3');

    //     cy.findByText('Save').click();

    //     // * Ensure error appears when saving a password outside of the limits
    //     cy.findByText('Minimum password length must be a whole number greater than or equal to 5 and less than or equal to 64.', {timeout: TIMEOUTS.ONE_MIN})
    //     .should('exist')
    //     .and('be.visible');
    // });


    it('MM-T1773 - Minimum password length field resets to default after saving invalid value', () => {
        cy.visit('/admin_console/authentication/password');

        cy.findByPlaceholderText('E.g.: "5"').clear().type('10');

        cy.findByRole('button', {name: 'Save'}).click();

        cy.reload();

        // * Ensure the limit 10 appears
        cy.findByPlaceholderText('E.g.: "5"').invoke('val').should('equal', '10');
        cy.findByPlaceholderText('E.g.: "5"').clear();

        cy.findByRole('button', {name: 'Save'}).click();

        // * Ensure the limit 10 appears
        cy.findByPlaceholderText('E.g.: "5"').invoke('val').should('equal', '5');
    });

});