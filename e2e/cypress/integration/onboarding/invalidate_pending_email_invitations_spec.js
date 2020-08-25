
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @onboarding

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getEmailUrl, getEmailMessageSeparator, reUrl, getRandomId} from '../../utils';

describe('Onboarding', () => {
    let testTeam;
    const usernameOne = `user${getRandomId()}`;
    const usernameTwo = `user${getRandomId()}`;
    const usernameThree = `user${getRandomId()}`;
    const emailOne = `${usernameOne}@sample.mattermost.com`;
    const emailTwo = `${usernameTwo}@sample.mattermost.com`;
    const emailThree = `${usernameThree}@sample.mattermost.com`;
    const password = 'passwd';

    const baseUrl = Cypress.config('baseUrl');
    const mailUrl = getEmailUrl(baseUrl);
    let isLicensed;

    before(() => {
        // # If the instance the test is running on is licensed, assign true to isLicensed variable
        cy.apiGetClientLicense().then(({license}) => {
            isLicensed = license.IsLicensed === 'true';
        });

        // # Disable LDAP and do email test if setup properly
        cy.apiUpdateConfig({LdapSettings: {Enable: false}});
        cy.apiEmailTest();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T399 Invalidate Pending Email Invitations', () => {
        // # Open the 'Invite People' full screen modal
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#invitePeople').find('button').eq(0).click();

        // # Wait half a second to ensure that the modal has been fully loaded and check if the instance is licensed
        cy.wait(TIMEOUTS.HALF_SEC);
        checkIfLicensed();

        // # Invite the first user (the one that won't be invalidated and logout)
        inviteNewUser(emailOne);
        cy.wait(TIMEOUTS.FIVE_SEC);
        cy.apiLogout();

        // # Get the email sent to the first user, verify the email and go to the provided link
        getEmail(usernameOne, emailOne);

        // # Type username and password
        cy.get('#name').should('be.visible').type(usernameOne);
        cy.get('#password').should('be.visible').type(password);

        // # Attempt to create an account by clicking on the 'Create Account' button
        cy.get('#createAccountButton').click();

        // * Check that the display name of the team the user was invited to is being correctly displayed
        cy.get('#headerTeamName').should('contain.text', testTeam.display_name);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // * Check that the 'Welcome to: Mattermost' message is visible
        cy.get('#tutorialIntroOne').findByText('Welcome to:').should('be.visible');
        cy.get('#tutorialIntroOne').findByText('Mattermost').should('be.visible');

        // # Logout from the current user and login as sysadmin
        cy.apiLogout();
        cy.apiAdminLogin();

        // # Open the 'Invite People' full screen modal
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#invitePeople').find('button').eq(0).click();

        // # Wait half a second to ensure that the modal has been fully loaded and check if the instance is licensed
        cy.wait(TIMEOUTS.HALF_SEC);
        checkIfLicensed();

        // # Invite two more users and close the modal
        inviteNewUser(emailTwo);
        cy.get('.invite-more').click();
        inviteNewUser(emailThree);
        cy.get('#closeIcon').should('be.visible').click();

        // # Go to system console and invalidate the last two email invites
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#systemConsole').should('be.visible').click();
        cy.findByText('Signup').scrollIntoView().should('be.visible').click();
        cy.get('#InvalidateEmailInvitesButton').should('be.visible').within(() => {
            cy.findByText('Invalidate pending email invites').should('be.visible').click();
        });

        // # Get the email sent to the second user, verify the email and go to the provided link
        getEmail(usernameTwo, emailTwo);

        // # Type username and password
        cy.get('#name').should('be.visible').type(usernameTwo);
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#password').should('be.visible').type(password);

        // # Attempt to create an account by clicking on the 'Create Account' button
        cy.get('#createAccountButton').click();

        // * Ensure that since the invite was invalidated, the correct error message should be shown
        cy.get('#existingEmailErrorContainer').should('exist').and('have.text', 'The signup link does not appear to be valid.');
    });

    function inviteNewUser(email) {
        cy.findByRole('textbox', {name: 'Add or Invite People'}).type(email, {force: true}).wait(TIMEOUTS.HALF_SEC).type('{enter}', {force: true});
        cy.get('#inviteMembersButton').click();
    }

    function checkIfLicensed() {
        if (isLicensed) {
            // # Click "Invite members"
            cy.findByTestId('inviteMembersLink').should('be.visible').click();
        }
    }

    function getEmail(username, email) {
        cy.task('getRecentEmail', {username, mailUrl}).then((response) => {
            const messageSeparator = getEmailMessageSeparator(baseUrl);
            verifyEmailInvite(response, testTeam.name, testTeam.display_name, email, messageSeparator);

            const bodyText = response.data.body.text.split('\n');
            const permalink = bodyText[6].match(reUrl)[0];

            // # Visit permalink (e.g. click on email link)
            cy.visit(permalink);
        });
    }

    function verifyEmailInvite(response, teamName, teamDisplayName, invitedUserEmail, messageSeparator) {
        const isoDate = new Date().toISOString().substring(0, 10);
        const {data, status} = response;

        // * Should return success status
        expect(status).to.equal(200);

        // * Verify that email is addressed to the correct user
        expect(data.to.length).to.equal(1);
        expect(data.to[0]).to.contain(invitedUserEmail);

        // * Verify that date is current
        expect(data.date).to.contain(isoDate);

        // * Verify that the email subject is correct
        expect(data.subject).to.contain(`[Mattermost] sysadmin invited you to join ${teamDisplayName} Team`);

        // * Verify that the email body is correct
        const bodyText = data.body.text.split(messageSeparator);
        expect(bodyText.length).to.equal(17);
        expect(bodyText[1]).to.equal('You\'ve been invited');
        expect(bodyText[4]).to.equal(`*sysadmin* , has invited you to join *${teamDisplayName}*.`);
        expect(bodyText[10]).to.contain(`${baseUrl}/${teamName}`);
    }
});
