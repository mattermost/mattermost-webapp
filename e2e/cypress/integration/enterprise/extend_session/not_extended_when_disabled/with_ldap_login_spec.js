// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @not_cloud @extend_session @ldap

import ldapUsers from '../../../../fixtures/ldap_users.json';

import {verifyExtendedSession, verifyNotExtendedSession} from './helpers';

describe('Extended Session Length', () => {
    const sessionLengthInDays = 1;
    const setting = {
        ServiceSettings: {
            SessionLengthWebInDays: sessionLengthInDays,
        },
    };
    let ldapUser;

    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.apiRequireLicense();

        // * Server database should match with the DB client and config at "cypress.json"
        cy.apiRequireServerDBToMatch();

        // # Test LDAP connection and synchronize user
        cy.apiLDAPTest();
        cy.apiLDAPSync();

        const ldapUserTest1 = ldapUsers['test-1'];
        cy.apiLogin(ldapUserTest1).then(({user}) => {
            cy.apiSaveTutorialStep(user.id, '999');
            ldapUser = {...user, password: ldapUserTest1.password};

            cy.apiAdminLogin();
            cy.apiSaveOnboardingPreference(user.id, 'hide', 'true');
            cy.apiInitSetup().then(({team}) => {
                cy.apiAddUserToTeam(team.id, user.id);
            });
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiRevokeUserSessions(ldapUser.id);
    });

    it('MM-T4046_1 LDAP user session should have extended due to user activity when enabled', () => {
        // # Enable ExtendSessionLengthWithActivity
        setting.ServiceSettings.ExtendSessionLengthWithActivity = true;
        cy.apiUpdateConfig(setting);

        verifyExtendedSession(ldapUser, sessionLengthInDays, () => cy.apiLogin(ldapUser));
    });

    it('MM-T4046_2 LDAP user session should not extend even with user activity when disabled', () => {
        // # Disable ExtendSessionLengthWithActivity
        setting.ServiceSettings.ExtendSessionLengthWithActivity = false;
        cy.apiUpdateConfig(setting);

        verifyNotExtendedSession(ldapUser, () => cy.apiLogin(ldapUser));
    });
});
