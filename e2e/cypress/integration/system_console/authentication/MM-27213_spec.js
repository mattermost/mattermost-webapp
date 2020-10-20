// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @notification

import * as TIMEOUTS from '../../../fixtures/timeouts';

import {getEmailUrl, reUrl} from '../../../utils';

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};


describe('Authentication', () => {
    let testUser;
    let mentionedUser;
    let testTeam;

    before(() => {
        // # Do email test if setup properly
        cy.apiEmailTest();

        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiCreateUser().then(({user: newUser}) => {
                mentionedUser = newUser;
            });

        });
    });

    // it('MM-T1764 - Security - Signup: Email verification required (after having created account when verification was not required)', () => {
    //     // # Update Configs
    //     cy.apiUpdateConfig({
    //         TeamSettings: {
    //             EnableOpenServer: true,
    //         },
    //         EmailSettings: {
    //             RequireEmailVerification: false,
    //         },
    //     });

    //     // # Login as test user and make sure it goes to team selection
    //     cy.apiLogin(mentionedUser);
    //     cy.visit('');
    //     cy.wait(TIMEOUTS.THREE_SEC);
    //     cy.get('#teamsYouCanJoinContent', {timeouts: TIMEOUTS.FIVE_SEC}).should('be.visible');

    //     cy.apiAdminLogin();

    //     // # Update Configs
    //     cy.apiUpdateConfig({
    //         EmailSettings: {
    //             RequireEmailVerification: true,
    //         },
    //     });

    //     cy.apiLogout();

    //     // # Login as test user and make sure it goes to team selection
    //     cy.visit('/login');

    //     // # Clear email/username field and type username
    //     cy.get('#loginId').clear().type(mentionedUser.username);

    //     // # Clear password field and type password
    //     cy.get('#loginPassword').clear().type(mentionedUser.password);

    //     // # Hit enter to login
    //     cy.get('#loginButton').click();

    //     cy.wait(TIMEOUTS.ONE_SEC);

    //     cy.findByTestId('emailVerifyResend').should('be.visible').click();
    //     cy.findByTestId('emailVerifySentMessage').should('be.visible');
    //     cy.findByTestId('emailVerifyAlmost').should('include.text', 'Mattermost: You are almost done');
    //     cy.findByTestId('emailVerifyNotVerifiedBody').should('include.text','Please verify your email address. Check your inbox for an email.');

    //     const baseUrl = Cypress.config('baseUrl');
    //     const mailUrl = getEmailUrl(baseUrl);

    //     cy.task('getRecentEmail', {username: mentionedUser.username, mailUrl}).then((response) => {

    //         const bodyText = response.data.body.text.split('\n');

    //         const permalink = bodyText[6].match(reUrl)[0];

    //         // # Visit permalink (e.g. click on email link), view in browser to proceed
    //         cy.visit(permalink);

    //         // # Clear password field
    //         cy.get('#loginPassword').clear().type(mentionedUser.password);

    //         // # Hit enter to login
    //         cy.get('#loginButton').click();

    //         // * Should show the join team stuff
    //         cy.get('#teamsYouCanJoinContent').should('be.visible');
    //     });
    // });

    it('MM-T1770 - Default password settings', () => {
        cy.apiUpdateConfig({
            PasswordSettings: {
                MinimumLength: null,
                Lowercase: null,
                Number: null,
                Uppercase: null,
                Symbol: null,
            },
            ServiceSettings : {
                MaximumLoginAttempts: null
            },
        });


        // * Ensure password has a minimum lenght of 10, all password requirements are checked, and the maximum login attempts is set to 10
        cy.apiGetConfig().then(({config: { PasswordSettings, ServiceSettings: {MaximumLoginAttempts}}}) => {
            expect(PasswordSettings.MinimumLength).equal(10);
            expect(PasswordSettings.Lowercase).equal(true);
            expect(PasswordSettings.Number).equal(true);
            expect(PasswordSettings.Uppercase).equal(true);
            expect(PasswordSettings.Symbol).equal(true);
            expect(MaximumLoginAttempts).equal(10);

        });
    });

    // it('MM-T1778 - MFA - Enforced', () => {

    // });


});

