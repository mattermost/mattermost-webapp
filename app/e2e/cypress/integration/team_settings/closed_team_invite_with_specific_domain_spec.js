
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @team_settings

import {generateRandomUser} from '../../support/api/user';

import {allowOnlyUserFromSpecificDomain, inviteUserByEmail, verifyEmailInviteAndVisitLink, signupAndVerifyTutorial} from './helpers';

describe('Team Settings', () => {
    let testTeam;
    const {username, email, password} = generateRandomUser();
    const emailDomain = 'sample.mattermost.com';

    before(() => {
        // # Delete license
        cy.apiDeleteLicense();

        // # Disable LDAP and do email test if setup properly
        cy.apiUpdateConfig({LdapSettings: {Enable: false}});
        cy.apiEmailTest();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T386 Invite new user to closed team with \'Allow only users with a specific email domain to join this team\' set to \'sample.mattermost.com\'', () => {
        // # Allow only users from 'sample.mattermost.com' domain
        allowOnlyUserFromSpecificDomain(emailDomain);

        // # Invite user via email
        inviteUserByEmail(email);

        // # Logout from sysadmin account
        cy.apiLogout();

        // # Invite a new user (with the email declared in the parent scope)
        verifyEmailInviteAndVisitLink(username, email, testTeam.name, testTeam.display_name);

        // # Signup and verify the initial tutorial
        signupAndVerifyTutorial(username, password, testTeam.display_name);
    });
});
