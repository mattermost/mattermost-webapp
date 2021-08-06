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
import {reUrl, getRandomId} from '../../../utils';

describe('Account Settings -> General -> Email', () => {
    let siteName;
    let testUser;
    let otherUser;
    let testTeam;

    before(() => {
        cy.apiUpdateConfig({EmailSettings: {RequireEmailVerification: true}}).then(({config}) => {
            siteName = config.TeamSettings.SiteName;
        });

        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiVerifyUserEmailById(testUser.id);

            return cy.apiCreateUser();
        }).then(({user: user1}) => {
            otherUser = user1;
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        // # Go to Account Settings
        cy.toAccountSettingsModal();
    });

    afterEach(() => {
        // # Close modal
        cy.get('body').type('{esc}');
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

    it('MM-T2066 email address required', () => {
        // # Click "Edit" to the right of "Email"
        cy.get('#emailEdit').should('be.visible').click();

        // # Save the settings
        cy.get('#saveSetting').click().wait(TIMEOUTS.HALF_SEC);

        // * Check that the correct error message is shown.
        cy.get('#clientError').should('be.visible').should('have.text', 'Please enter a valid email address');
    });

    it('MM-T2067 email address already taken error', () => {
        // # Click "Edit" to the right of "Email"
        cy.get('#emailEdit').should('be.visible').click();

        // # Type different email
        cy.get('#primaryEmail').should('be.visible').type(otherUser.email);
        cy.get('#confirmEmail').should('be.visible').type(otherUser.email);
        cy.get('#currentPassword').should('be.visible').type(otherUser.password);

        // # Save the settings
        cy.get('#saveSetting').click().wait(TIMEOUTS.HALF_SEC);

        // * Check that the correct error message is shown.
        cy.get('#serverError').should('be.visible').should('have.text', 'An account with that email already exists.');
    });

    it('MM-T2068 email address and confirmation don\'t match', () => {
        // # Click "Edit" to the right of "Email"
        cy.get('#emailEdit').should('be.visible').click();

        // # Type some random email
        cy.get('#primaryEmail').should('be.visible').type('random@example.com');
        cy.get('#confirmEmail').should('be.visible').clear();
        cy.get('#currentPassword').should('be.visible').type('randompass');

        // # Save the settings
        cy.get('#saveSetting').click().wait(TIMEOUTS.HALF_SEC);

        // * Check that the correct error message is shown.
        cy.get('#clientError').should('be.visible').should('have.text', 'The new emails you entered do not match.');
    });

    // This test is a combination of 4 sub-tests because they are sub-parts of the same test.
    // Doing them individually would have a dependency with the previous test.
    // Hence, a combined single test for everything is better.
    it('MM-T2069 Email: Can update email address and verify through email notification', () => {
        // # Click "Edit" to the right of "Email"
        cy.get('#emailEdit').should('be.visible').click();

        const randomId = getRandomId();
        const username = `user-${randomId}`;
        const email = `${username}@example.com`;

        // # Type new email
        cy.get('#primaryEmail').should('be.visible').type(email);
        cy.get('#confirmEmail').should('be.visible').type(email);
        cy.get('#currentPassword').should('be.visible').type(testUser.password);

        // # Save the settings and close
        cy.get('#saveSetting').click().wait(TIMEOUTS.HALF_SEC);
        cy.uiClose();

        // * Verify the announcement bar
        cy.get('.announcement-bar').should('be.visible').should('contain.text', 'Check your email inbox to verify the address.');

        // # Reload the page
        cy.reload();

        // * Check that the email verification message is not showed.
        cy.get('.announcement-bar').should('not.exist');

        cy.getRecentEmail({username, email}).then((data) => {
            // * Verify the subject
            expect(data.subject).to.equal(`[${siteName}] Verify new email address`);

            // * Verify the body
            expect(data.body).to.contain('You updated your email');
            const matched = data.body[6].match(reUrl);
            assert(matched.length > 0);

            const permalink = matched[0];

            // # Click on the link
            cy.visit(permalink);

            // * Verify announcement bar
            cy.get('.announcement-bar').should('be.visible').should('contain.text', 'Email verified');

            // # Wait for one second for the mail to be sent out.
            cy.wait(TIMEOUTS.FIVE_SEC);

            cy.getRecentEmail(testUser).then(({subject}) => {
                // * Verify the subject
                expect(subject).to.equal(`[${siteName}] Your email address has changed`);
            });

            cy.toAccountSettingsModal();

            // * Verify new email address
            cy.get('#emailDesc').should('be.visible').should('have.text', email);
        });
    });

    it('MM-T2073 - Verify email verification message after logout', () => {
        // # Click "Edit" to the right of "Email"
        cy.get('#emailEdit').should('be.visible').click();

        const randomId = getRandomId();
        const username = `user-${randomId}`;
        const email = `${username}@example.com`;

        // # Type new email
        cy.get('#primaryEmail').should('be.visible').type(email);
        cy.get('#confirmEmail').should('be.visible').type(email);
        cy.get('#currentPassword').should('be.visible').type(testUser.password);

        // # Save the settings
        cy.get('#saveSetting').click().wait(TIMEOUTS.HALF_SEC);

        // # Close modal
        cy.get('body').type('{esc}');
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#logout').should('be.visible').click();

        // # Wait for one second for the mail to be sent out.
        cy.wait(TIMEOUTS.ONE_SEC);

        cy.getRecentEmail({username, email}).then((data) => {
            // * Verify the subject
            expect(data.subject).to.equal(`[${siteName}] Verify new email address`);

            // * Verify email body
            expect(data.body[1]).to.contain('You updated your email');
            const matched = data.body[6].match(reUrl);
            assert(matched.length > 0);

            const permalink = matched[0];
            cy.visit(permalink);

            // * Verify login text
            cy.get('#login_section .alert-success').should('contain.text', 'Email Verified');

            // # Do login
            cy.get('#loginId').should('be.visible').clear().type(email);
            cy.get('#loginPassword').should('be.visible').type(testUser.password);
            cy.get('#loginButton').should('be.visible').click();

            // * Check that the email verification message is not showed.
            cy.get('.announcement-bar').should('not.exist');
        });
    });
});
