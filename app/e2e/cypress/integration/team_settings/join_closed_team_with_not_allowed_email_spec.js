// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @team_settings

import {getRandomId} from '../../utils';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Team Settings', () => {
    const randomId = getRandomId();
    const emailDomain = 'sample.mattermost.com';

    before(() => {
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: false,
            },
            LdapSettings: {
                Enable: false,
            },
        });

        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}`);
        });
    });

    it('MM-T387 - Try to join a closed team from a NON-mattermost email address via "Get Team Invite Link" while "Allow only users with a specific email domain to join this team" set to "sample.mattermost.com"', () => {
        // Open 'Team Settings' modal
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.findByText('Team Settings').should('be.visible').click();

        // * Check that the 'Team Settings' modal was opened
        cy.get('#teamSettingsModal').should('exist').within(() => {
            // # Click on the 'Allow only users with a specific email domain to join this team' edit button
            cy.get('#allowed_domainsEdit').should('be.visible').click();

            // # Set 'sample.mattermost.com' as the only allowed email domain and save
            cy.wait(TIMEOUTS.HALF_SEC);
            cy.focused().type(emailDomain);
            cy.findByText('Save').should('be.visible').click();

            // # Close the modal
            cy.get('#teamSettingsModalLabel').find('button').should('be.visible').click();
        });

        // # Open the 'Invite People' full screen modal and get the invite url
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#invitePeople').find('button').eq(0).click();
        cy.get('.share-link-input').invoke('val').then((val) => {
            const inviteLink = val;

            // # Logout from admin account and visit the invite url
            cy.apiLogout();
            cy.visit(inviteLink);
        });

        const email = `user${randomId}@sample.gmail.com`;
        const username = `user${randomId}`;
        const password = 'passwd';
        const errorMessage = `The following email addresses do not belong to an accepted domain: ${emailDomain}. Please contact your System Administrator for details.`;

        // # Type email, username and password
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#email').type(email);

        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#name').type(username);

        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#password').type(password);

        // # Attempt to create an account by clicking on the 'Create Account' buton
        cy.get('#createAccountButton').click();

        // * Assert that the expected error message from creating an account with an email not from the allowed email domain exists and is visible
        cy.findByText(errorMessage).should('be.visible');
    });
});

