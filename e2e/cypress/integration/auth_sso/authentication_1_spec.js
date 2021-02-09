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

import {getEmailUrl, getRandomId} from '../../utils';

describe('Authentication', () => {
    let testUser;
    let testUserAlreadyInTeam;
    let testTeam;

    before(() => {
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

    it('MM-T1756 - Restrict Domains - Multiple - success', () => {
        // # Enable open server and turn on user account creation and set restricted domain
        cy.apiUpdateConfig({
            TeamSettings: {
                RestrictCreationToDomains: 'mattermost.com, test.com',
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        }).then(() => {
            cy.apiLogout();

            // # Go to front page
            cy.visit('/login');

            // * Assert that create account button is visible
            cy.findByText('Create one now.', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

            // # Go to sign up with email page
            cy.visit('/signup_email');

            cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein2Cool4School${getRandomId()}@mattermost.com`);

            cy.get('#password').type('Test123456!');

            cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

            cy.findByText('Create Account').click();

            // * Make sure account was created successfully and we are at the select team page
            cy.findByText('Teams you can join:', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        });
    });

    it('MM-T1757 - Restrict Domains - Multiple - fail', () => {
        // # Enable open server and turn on user account creation
        cy.apiUpdateConfig({
            TeamSettings: {
                RestrictCreationToDomains: 'mattermost.com, test.com',
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        }).then(() => {
            cy.apiLogin(testUserAlreadyInTeam);

            cy.visit('/');

            // * Verify the side bar is visible
            cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

            // # Click on the side bar
            cy.get('#sidebarHeaderDropdownButton').click();

            // * Verify Account Settings button is visible and exist and then click on it
            cy.findByText('Account Settings', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('exist').click();

            // # Click "Edit" to the right of "Email"
            cy.get('#emailEdit').should('be.visible').click();

            // # Type new email
            cy.get('#primaryEmail').should('be.visible').type('user-123123@example.com');
            cy.get('#confirmEmail').should('be.visible').type('user-123123@example.com');
            cy.get('#currentPassword').should('be.visible').type(testUser.password);

            // # Save the settings
            cy.get('#saveSetting').click().wait(TIMEOUTS.HALF_SEC);

            // * Assert an error exist and is what is expected
            cy.findByText('The email you provided does not belong to an accepted domain. Please contact your administrator or sign up with a different email.').should('be.visible');
        });
    });

    it('MM-T1758 - Restrict Domains - Team invite closed team', () => {
        // # Enable open server and turn off user account creation and set restricted domain
        cy.apiUpdateConfig({
            TeamSettings: {
                RestrictCreationToDomains: 'mattermost.com, test.com',
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        }).then(() => {
            cy.apiLogout();

            cy.visit(`/signup_email/?id=${testTeam.invite_id}`);

            cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

            cy.get('#password').type('Test123456!');

            cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

            cy.findByText('Create Account').click();

            // * Make sure account was not created successfully
            cy.findByText('The email you provided does not belong to an accepted domain. Please contact your administrator or sign up with a different email.').should('be.visible').and('exist');
        });
    });

    it('MM-T1762 - Invite Salt', () => {
        cy.visit('/admin_console/site_config/public_links');

        cy.findByText('Regenerate', {timeout: TIMEOUTS.ONE_MIN}).click();

        // * Assert that create account button is visible
        cy.get('#FileSettings.PublicLinkSalt', {timeout: TIMEOUTS.ONE_MIN}).should('not.have.text', '********************************');
    });

    it('MM-T1763 - Security - Signup: Email verification not required, user immediately sees Town Square', () => {
        // # Enable open server and turn on user account creation and set restricted domain
        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: false,
            },
            TeamSettings: {
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        }).then(() => {
            cy.apiLogout();

            // # Go to front page
            cy.visit('/login');

            // * Assert that create account button is visible
            cy.findByText('Create one now.', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

            // # Go to sign up with email page
            cy.visit('/signup_email');

            const username = `Hossein${getRandomId()}`;

            cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`${username}@example.com`);

            cy.get('#password').type('Test123456!');

            cy.get('#name').clear().type(`${username}`);

            cy.findByText('Create Account').click();

            // * Make sure account was created successfully and we are on the team joining page
            cy.findByText('Teams you can join:', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

            const mailUrl = getEmailUrl(Cypress.config('baseUrl'));

            cy.task('getRecentEmail', {username, mailUrl}).then((response) => {
                // * Verify the subject
                expect(response.data.subject).to.include('[Mattermost] You joined');
            });
        });
    });

    it('MM-T1765 - Authentication - Email - Creation with email = false', () => {
        // # Enable open server and turn on user account creation and set restricted domain
        cy.apiUpdateConfig({
            EmailSettings: {
                EnableSignUpWithEmail: false,
            },
            TeamSettings: {
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
            GitLabSettings: {
                DiscoveryEndpoint: '',
                Enable: true,
                TokenEndpoint: '',
                UserApiEndpoint: '',
            },
        }).then(() => {
            cy.apiLogout();

            cy.visit(`/signup_user_complete/?id=${testTeam.invite_id}`);

            cy.findByText('GitLab Single Sign-On', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

            // * Email and Password option does not exist
            cy.findByText('Email and Password').should('not.exist').and('not.be.visible');
        });
    });
});
