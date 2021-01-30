// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console @authentication

import * as TIMEOUTS from '../../fixtures/timeouts';

import {getRandomId} from '../../utils';

describe('Authentication', () => {
    beforeEach(() => {
        // # Log in as admin.
        cy.apiAdminLogin();
    });

    it('MM-T1771 - Minimum password length error field shows below 5 and above 64', () => {
        cy.visit('/admin_console/authentication/password');

        cy.findByPlaceholderText('E.g.: "5"', {timeout: TIMEOUTS.ONE_MIN}).clear().type('88');

        cy.findByText('Save').click();

        // * Ensure error appears when saving a password outside of the limits
        cy.findByText('Minimum password length must be a whole number greater than or equal to 5 and less than or equal to 64.', {timeout: TIMEOUTS.ONE_MIN}).
            should('exist').
            and('be.visible');

        cy.findByPlaceholderText('E.g.: "5"').clear().type('3');

        cy.findByText('Save').click();

        // * Ensure error appears when saving a password outside of the limits
        cy.findByText('Minimum password length must be a whole number greater than or equal to 5 and less than or equal to 64.', {timeout: TIMEOUTS.ONE_MIN}).
            should('exist').
            and('be.visible');
    });

    it('MM-T1772 - Change minimum password length, verify help text and error message', () => {
        cy.visit('/admin_console/authentication/password');

        cy.findByPlaceholderText('E.g.: "5"', {timeout: TIMEOUTS.ONE_MIN}).clear().type('7');

        cy.findByRole('button', {name: 'Save'}).click();

        cy.findByText('Your password must contain between 7 and 64 characters.').should('be.visible').and('exist');

        cy.apiLogout();

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#name').clear().type(`BestUsername${getRandomId()}`);

        cy.get('#password').clear().type('less');

        cy.findByText('Create Account').click();

        // * Assert the error is what is expected;
        cy.findByText('Your password must contain between 7 and 64 characters.').should('be.visible');

        cy.get('#password').clear().type('greaterthan7');

        cy.findByText('Create Account').click();

        // * Assert that we are not shown a MFA scren and instead a Teams You Can join page
        cy.findByText('Teams you can join:', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });

    it('MM-T1773 - Minimum password length field resets to default after saving invalid value', () => {
        cy.visit('/admin_console/authentication/password');

        cy.findByPlaceholderText('E.g.: "5"', {timeout: TIMEOUTS.ONE_MIN}).clear().type('10');

        cy.findByRole('button', {name: 'Save'}).click();

        cy.reload();

        // * Ensure the limit 10 appears
        cy.findByPlaceholderText('E.g.: "5"').invoke('val').should('equal', '10');
        cy.findByPlaceholderText('E.g.: "5"').clear();

        cy.findByRole('button', {name: 'Save'}).click();

        // * Ensure the limit 10 appears
        cy.findByPlaceholderText('E.g.: "5"').invoke('val').should('equal', '5');
    });

    it('MM-T1774 - Select all Password Requirements, verify help text and error on bad password', () => {
        cy.apiUpdateConfig({
            PasswordSettings: {
                Lowercase: true,
                Number: true,
                Uppercase: true,
                Symbol: true,
            },
        });

        cy.apiLogout();

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#name').clear().type(`BestUsernameInTheWorld${getRandomId()}`);

        ['NOLOWERCASE123!', 'noupppercase123!', 'NoNumber!', 'NoSymbol123'].forEach((option) => {
            cy.get('#password').clear().type(option);
            cy.findByText('Create Account').click();

            // * Assert the error is what is expected;
            cy.findByText('Your password must contain between 5 and 64 characters made up of at least one lowercase letter, at least one uppercase letter, at least one number, and at least one symbol (e.g. "~!@#$%^&*()").').should('be.visible');
        });
    });

    it('MM-T1775 - Maximum Login Attempts field resets to default after saving invalid value', () => {
        cy.visit('/admin_console/authentication/password');

        cy.findByPlaceholderText('E.g.: "10"', {timeout: TIMEOUTS.ONE_MIN}).clear().type('ten');

        cy.findByRole('button', {name: 'Save'}).click();

        // * Ensure error appears when saving a password outside of the limits
        cy.findByPlaceholderText('E.g.: "10"').invoke('val').should('equal', '10');
    });

    it('MM-T1776 - Maximum Login Attempts field successfully saves valid change', () => {
        cy.visit('/admin_console/authentication/password');

        cy.findByPlaceholderText('E.g.: "10"', {timeout: TIMEOUTS.ONE_MIN}).clear().type('2');

        cy.findByRole('button', {name: 'Save'}).click();

        // * Ensure error appears when saving a password outside of the limits
        cy.findByPlaceholderText('E.g.: "10"').invoke('val').should('equal', '2');
    });

    it('MM-T1777 - Multi-factor Authentication option hidden in Account Settings when disabled', () => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: false,
            },
        });

        cy.visit('/');

        cy.toAccountSettingsModal();

        cy.findByLabelText('security').click();

        // * Assert that Multifactor Authentication text does not exist
        cy.findByText('Multi-factor Authentication').should('not.exist').and('not.be.visible');
    });

    it('MM-T1779 - Multi-factor Authentication option appears in Account Settings when enabled', () => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
            },
        });

        cy.visit('/');

        cy.toAccountSettingsModal();

        cy.findByLabelText('security').click();

        // * Assert that Multifactor Authentication text does exist
        cy.findByText('Multi-factor Authentication').should('exist').and('be.visible');
    });

    it('MM-T1780 - Multi-factor Authentication false: User can log in without being prompted for MFA', () => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
                EnforceMultifactorAuthentication: false,

            },
        });

        cy.apiCreateUser().then(({user: newUser}) => {
            cy.apiLogout();

            // # Login as a new user and visit default page
            cy.apiLogin(newUser);
            cy.visit('/');

            // * Assert that we are not shown a MFA screen and instead a Teams You Can join page
            cy.findByText('Teams you can join:', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        });
    });
});
