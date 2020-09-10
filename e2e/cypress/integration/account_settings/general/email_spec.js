// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Account Settings -> General -> Email', () => {
    let testUser;

    before(() => {
        cy.apiUpdateConfig({EmailSettings: {RequireEmailVerification: true}});

        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            cy.apiVerifyUserEmailById(testUser.id);

            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        // # Go to Account Settings
        cy.toAccountSettingsModal();
    });

    it('MM-T2065 Email: Can "change" to existing email address and save', () => {
        // # Click "Edit" to the right of "Email"
        cy.get('#emailEdit').should('be.visible').click();

        // # Type the same email
        cy.get('#primaryEmail').should('be.visible').type(testUser.email);
        cy.get('#confirmEmail').should('be.visible').type(testUser.email);
        cy.get('#currentPassword').should('be.visible').type('SampleUs@r-1');

        // # Save the settings
        cy.get('#saveSetting').click().wait(TIMEOUTS.HALF_SEC);

        // * Check that the email verification message is not showed.
        cy.get('.announcement-bar').should('not.exist');
    });
});
