// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '@mattermost/types/users';
import {User} from '../env';

import {ChainableT, ResponseT} from './types';

// *****************************************************************************
// LDAP
// https://api.mattermost.com/#tag/LDAP
// *****************************************************************************

function apiLDAPSync(): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/ldap/sync',
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiLDAPSync', apiLDAPSync);

function apiLDAPTest(): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/ldap/test',
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiLDAPTest', apiLDAPTest);

function apiSyncLDAPUser({
    ldapUser = {},
    bypassTutorial = true,
}): ChainableT<UserProfile>  {
    // # Test LDAP connection and synchronize user
    cy.apiLDAPTest();
    cy.apiLDAPSync();

    // # Login to sync LDAP user
    return cy.apiLogin(ldapUser as User).then(({user}) => {
        if (bypassTutorial) {
            cy.apiAdminLogin();
        }
        if (bypassTutorial) {
            cy.apiSaveTutorialStep(user.id, '999');
        }

        return cy.wrap(user);
    });
}
Cypress.Commands.add('apiSyncLDAPUser', apiSyncLDAPUser);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Synchronize any user attribute changes in the configured AD/LDAP server with Mattermost.
             * See https://api.mattermost.com/#operation/SyncLdap
             *
             * @example
             *   cy.apiLDAPSync();
             */
            apiLDAPSync: typeof apiLDAPSync;

            /**
             * Test the current AD/LDAP configuration to see if the AD/LDAP server can be contacted successfully.
             * See https://api.mattermost.com/#operation/TestLdap
             *
             * @example
             *   cy.apiLDAPTest();
             */
            apiLDAPTest(): Chainable;

            /**
             * Sync LDAP user
             * @returns {UserProfile} user - user object
             *
             * @example
             *   cy.apiSyncLDAPUser();
             */
            apiSyncLDAPUser: typeof apiSyncLDAPUser;
        }
    }
}
