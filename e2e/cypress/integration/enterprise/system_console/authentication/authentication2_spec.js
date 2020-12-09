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

describe('Authentication Part 2', () => {
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

        // # Log in as a admin.
        cy.apiAdminLogin();
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
        });

        cy.apiLogout();

        // # Go to front page
        cy.visit('/login');

        // * Assert that create account ubtton is visible
        cy.get('#signup', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein2Cool4School${getRandomId()}@mattermost.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

        cy.get('#createAccountButton').click();

        // * Make sure account was created successfully and we are at the select team page
        cy.get('#teamsYouCanJoinContent', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });

    it('MM-T1757 - Restrict Domains - Multiple - fail', () => {
        // # Enable open server and turn on user account creation
        cy.apiUpdateConfig({
            TeamSettings: {
                RestrictCreationToDomains: 'mattermost.com, test.com',
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        });

        cy.apiLogin(testUserAlreadyInTeam);

        cy.visit('/');

        // * Verify the side bar is visible
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Click on the side bar
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Verify Account Settings button is visible
        cy.get('#accountSettings').should('be.visible').and('contain', 'Account Settings');

        // # Click on the Account Settings button
        cy.get('#accountSettings').click();

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

    it('MM-T1758 - Restrict Domains - Team invite closed team', () => {
        // # Enable open server and turn off user account creation and set restricted domain
        cy.apiUpdateConfig({
            TeamSettings: {
                RestrictCreationToDomains: 'mattermost.com, test.com',
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        });

        cy.apiLogout();

        cy.visit(`/signup_email/?id=${testTeam.invite_id}`);

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

        cy.get('#createAccountButton').click();

        // * Make sure account was not created successfully
        cy.get('#existingEmailErrorContainer').should('have.text', 'The email you provided does not belong to an accepted domain. Please contact your administrator or sign up with a different email.');
    });

    it('MM-T1759 - Restrict Domains - Team invite open team', () => {
        // # Enable open server and turn on user account creation and set restricted domain
        cy.apiUpdateConfig({
            TeamSettings: {
                RestrictCreationToDomains: 'mattermost.com, test.com',
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        });

        cy.visit(`/admin_console/user_management/teams/${testTeam.id}`);

        cy.findByTestId('allowAllToggleSwitch').click();

        // # Click "Save"
        cy.get('#saveSetting').click();

        // # Wait until we are at the Mattermost Teams page
        cy.findByText('Mattermost Teams', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        cy.apiLogout();

        cy.visit(`/signup_email/?id=${testTeam.invite_id}`);

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

        cy.get('#createAccountButton').click();

        // * Make sure account was not created successfully
        cy.get('#existingEmailErrorContainer').should('have.text', 'The email you provided does not belong to an accepted domain. Please contact your administrator or sign up with a different email.');
    });

    it('MM-T1760 - Enable Open Server false: Create account link is hidden', () => {
        // # Enable open server and turn on user account creation and set restricted domain
        cy.apiUpdateConfig({
            TeamSettings: {
                EnableOpenServer: false,
            },
        });

        cy.apiLogout();

        cy.visit('/');

        // * Assert that create account button is not visible
        cy.get('#signup', {timeout: TIMEOUTS.ONE_MIN}).should('not.be.visible');
    });

    it('MM-T1761 - Enable Open Server - Create link appears if email account creation is false and other signin methods are true', () => {
        // # Enable open server and turn on user account creation and set restricted domain
        cy.apiUpdateConfig({
            EmailSettings: {
                EnableSignUpWithEmail: false,
            },
            TeamSettings: {
                EnableOpenServer: true,
            },
            LdapSettings: {
                Enable: true,
            },
        });

        cy.apiLogout();

        cy.visit('/');

        // * Assert that create account button is visible
        cy.get('#signup', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });

    it('MM-T1762 - Invite Salt', () => {
        cy.visit('/admin_console/site_config/public_links');

        cy.findByText('Regenerate').click();

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
        });

        cy.apiLogout();

        // # Go to front page
        cy.visit('/login');

        // * Assert that create account ubtton is visible
        cy.get('#signup', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Go to sign up with email page
        cy.visit('/signup_email');

        const username = `Hossein${getRandomId()}`;

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`${username}@example.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`${username}`);

        cy.get('#createAccountButton').click();

        // * Make sure account was created successfully and we are at the select team page
        cy.get('#teamsYouCanJoinContent', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        const mailUrl = getEmailUrl(Cypress.config('baseUrl'));

        cy.task('getRecentEmail', {username, mailUrl}).then((response) => {
            // * Verify the subject
            expect(response.data.subject).to.include('[Mattermost] You joined');
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
        });

        cy.apiLogout();

        cy.visit(`/signup_user_complete/?id=${testTeam.invite_id}`);

        cy.findByText('GitLab Single Sign-On', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // * Email and Password option does not exist
        cy.findByText('Email and Password').should('not.exist').and('not.be.visible');
    });

    it('MM-T1766 - Authentication - Email - Creation with email = true', () => {
        // # Enable open server and turn on user account creation and set restricted domain
        cy.apiUpdateConfig({
            EmailSettings: {
                EnableSignUpWithEmail: true,
            },
            TeamSettings: {
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        });

        cy.apiLogout();

        cy.visit(`/signup_user_complete/?id=${testTeam.invite_id}`);

        // * Email and Password option exist
        cy.findByText('Email and Password', {timeout: TIMEOUTS.ONE_MIN}).should('exist').and('be.visible');
    });
});
