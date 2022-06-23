// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

import {CreateTeamSettings} from './saml_commands';

export interface CheckLoginSettings {
     siteName?: string;
}

function checkLoginPage(settings: CheckLoginSettings = {}) {
    // # Remove autofocus from login input
    cy.get('.login-body-card-content').should('be.visible').focus();

    // * Check elements in the body
    cy.get('#input_loginId', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and(($loginTextbox: JQuery<HTMLInputElement>) => {
        const placeholder = $loginTextbox[0].placeholder;
        expect(placeholder).to.match(/Email/);
        expect(placeholder).to.match(/Username/);
    }).focus();

    cy.get('#input_password-input').should('be.visible').and('have.attr', 'placeholder', 'Password');
    cy.get('#saveSetting').should('be.visible');

    // * Check the title
    cy.title().should('include', settings.siteName);
}
Cypress.Commands.add('checkLoginPage', checkLoginPage);

function checkLoginFailed() {
    // * Check the alert banner
    cy.get('.AlertBanner.danger', {timeout: TIMEOUTS.ONE_MIN}).then(() => {
        // * Check the login input in error
        cy.get('.login-body-card-form-input .Input_fieldset').should('have.class', 'Input_fieldset___error');

        // * Check the password input in error
        cy.get('.login-body-card-form-password-input.Input_fieldset').should('have.class', 'Input_fieldset___error');

        // * Check the Log in button enabled
        cy.get('#saveSetting').should('not.be.disabled');
    });
}
Cypress.Commands.add('checkLoginFailed', checkLoginFailed);

function checkGuestNoChannels() {
    cy.findByText('Your guest account has no channels assigned. Please contact an administrator.').should('be.visible');
}
Cypress.Commands.add('checkGuestNoChannels', checkGuestNoChannels);

function checkMemberNoChannels() {
    cy.findByText('No teams are available to join. Please create a new team or ask your administrator for an invite.').should('be.visible');
}
Cypress.Commands.add('checkMemberNoChannels', checkMemberNoChannels);


interface User {
    isAdmin: boolean;
    userType: string;
    username: string;
}

export interface CheckLeftSidebarOptions {
    teamName?: string | null;
    user: User;
}

function checkLeftSideBar(settings: CheckLeftSidebarOptions) {
    if (settings.teamName != null && settings.teamName.length > 0) {
        cy.uiGetLHSHeader().should('contain', settings.teamName);
    }

    if (settings.user.username.length > 0) {
        // * Verify username info
        cy.uiOpenUserMenu().findByText(`@${settings.user.username}`);

        // # Close status menu
        cy.uiGetSetStatusButton().click();
    }

    if (settings.user.userType === 'Admin' || settings.user.isAdmin) {
        // # Check that user is an admin
        cy.uiOpenProductMenu().findByText('System Console');
    } else {
        // # Check that user is not an admin
        cy.uiOpenProductMenu().findByText('System Console').should('not.exist');
    }

    // # Close product switch menu
    cy.uiGetProductMenuButton().click();

    cy.get('#channel_view').should('be.visible');
}
Cypress.Commands.add('checkLeftSideBar', checkLeftSideBar);

interface CheckInvitePeoplePageOptions {
    teamName?: string | null; 
}

function checkInvitePeoplePage(options: CheckInvitePeoplePageOptions = {}): void {
    cy.findByText('Copy invite link', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    if (options.teamName != null && options.teamName.length > 0) {
        const inviteRegexp = new RegExp(`Invite .* to ${options.teamName}`);
        cy.findByText(inviteRegexp).should('be.visible');
    }
}
Cypress.Commands.add('checkInvitePeoplePage', checkInvitePeoplePage);

interface CheckInvitePeopleAdminSettings {
    teamName?: string | null;
}

function checkInvitePeopleAdminPage(settings: CheckInvitePeopleAdminSettings) {
    cy.findByText('Members', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    cy.findByText('Guests').should('be.visible');
    if (settings.teamName != null && settings.teamName.length > 0) {
        cy.findByText('Invite people to ' + settings.teamName).should('be.visible');
    }
}
Cypress.Commands.add('checkInvitePeopleAdminPage', checkInvitePeopleAdminPage);

function doLogoutFromSignUp() {
    cy.checkGuestNoChannels();
    cy.findByText('Logout').should('be.visible').click();
}
Cypress.Commands.add('doLogoutFromSignUp', doLogoutFromSignUp);

function doMemberLogoutFromSignUp() {
    cy.checkMemberNoChannels();
    cy.findByText('Logout').should('be.visible').click();
}
Cypress.Commands.add('doMemberLogoutFromSignUp', doMemberLogoutFromSignUp);

function skipOrCreateTeam(settings: CreateTeamSettings, userId: string) {
    cy.wait(TIMEOUTS.FIVE_SEC);
    return cy.get('body').then((body) => {
        let teamName = '';

        // # Create a team if a user is not member of any team
        if (body.text().includes('Create a team')) {
            teamName = 't' + userId.substring(0, 14);

            cy.checkCreateTeamPage(settings);

            cy.get('#createNewTeamLink').scrollIntoView().should('be.visible').click();
            cy.get('#teamNameInput').should('be.visible').type(teamName, {force: true});
            cy.findByText('Next').should('be.visible').click();
            cy.findByText('Finish').should('be.visible').click();
        }

        return cy.wrap(teamName);
    });
}
Cypress.Commands.add('skipOrCreateTeam', skipOrCreateTeam);

function checkForLDAPError(): Cypress.Chainable<boolean> {
    cy.wait(TIMEOUTS.FIVE_SEC);
    return cy.get('body').then((body) => {
        if (body.text().includes('User not registered on AD/LDAP server.')) {
            cy.findByText('Back to Mattermost').should('exist').and('be.visible').click().wait(TIMEOUTS.FIVE_SEC);
            return cy.wrap(true);
        }
        return cy.wrap(false);
    });
}
Cypress.Commands.add('checkForLDAPError', checkForLDAPError);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * checkForLDAPError verifies that an LDAP error is displayed.
             */
            checkForLDAPError: typeof checkForLDAPError;

            /**
             * checkLoginPage verifies the login form exists on the current page
             */
            checkLoginPage: typeof checkLoginPage;

            /**
             * checkLeftSideBar verifies the left hand side bar displays the ui expected
             * for a user with a given role
             */
            checkLeftSideBar: typeof checkLeftSideBar;

            /**
             * checkInvitePeoplePage verifies the invite people page shows the team to be invited to
             */
            checkInvitePeoplePage: typeof checkInvitePeoplePage;

            /**
             * checkLoginFaild verifies the login form submission failed to log the user in.
             */
            checkLoginFailed: typeof checkLoginFailed;

            /**
             * checkGuestNoChannels checks that the guest receives the guest version of 
             * the "no channels" ui.
             */
            checkGuestNoChannels: typeof checkGuestNoChannels;

            /**
             * checkMemberNoChannels checks that the guest receives the member version of 
             * the "no channels" ui.
             */
            checkMemberNoChannels: typeof checkMemberNoChannels;

            // checks that the admin's invite page allows inviting members and guests
            // and if a team is passed, that the team name is mentioned in the UI
            checkInvitePeopleAdminPage: typeof checkInvitePeopleAdminPage;

            // doLogoutFromSignUp checks that the guests no channels ui is present,
            // and then logs out
            doLogoutFromSignUp: typeof doLogoutFromSignUp;

            // doMemberLogoutFromSignUp checks that the members no channels ui is present,
            // and then logs out
            doMemberLogoutFromSignUp: typeof doMemberLogoutFromSignUp; 

            // skipOrCreateTeam creates a team if the user does not belong to one.
            skipOrCreateTeam: typeof skipOrCreateTeam;
        }
    }
}
