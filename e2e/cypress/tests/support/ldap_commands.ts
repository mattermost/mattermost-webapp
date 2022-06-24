// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

import type {ExternalRequestUser} from '../plugins/external_request';

import {ChainableT} from './api/types';
import type {CheckLeftSidebarOptions} from './common_login_commands';

import {getAdminAccount} from './env';

function visitLDAPSettings() {
    // # Go to LDAP settings Page
    cy.visit('/admin_console/authentication/ldap');
    cy.get('.admin-console__header').should('be.visible').and('have.text', 'AD/LDAP');
}
Cypress.Commands.add('visitLDAPSettings', visitLDAPSettings);

function doLDAPLogin(settings = ({} as PerformLDAPLoginSettings & {siteName?: string}), useEmail = false) {
    // # Go to login page
    cy.apiLogout();
    cy.visit('/login');
    cy.wait(TIMEOUTS.FIVE_SEC);
    cy.checkLoginPage(settings);
    cy.performLDAPLogin(settings, useEmail);
}
Cypress.Commands.add('doLDAPLogin', doLDAPLogin);

interface PerformLDAPLoginSettings {
    user: {
        email: string;
        username: string;
        password: string;
    };
}
function performLDAPLogin(settings = ({} as PerformLDAPLoginSettings), useEmail = false) {
    const loginId = useEmail ? settings.user.email : settings.user.username;
    cy.get('#input_loginId').type(loginId);
    cy.get('#input_password-input').type(settings.user.password);

    //click the login button
    cy.get('#saveSetting').should('not.be.disabled').click();
}
Cypress.Commands.add('performLDAPLogin', performLDAPLogin);

function doLDAPLogout(settings = ({} as {siteName?: string} & CheckLeftSidebarOptions)) {
    cy.checkLeftSideBar(settings);

    // # Logout then check login page
    cy.uiLogout();
    cy.checkLoginPage(settings);
}
Cypress.Commands.add('doLDAPLogout', doLDAPLogout);

function doSkipTutorial() {
    cy.wait(TIMEOUTS.FIVE_SEC);
    cy.get('body').then((body) => {
        if (body.find('#tutorialSkipLink').length > 0) {
            cy.get('#tutorialSkipLink').click().wait(TIMEOUTS.HALF_SEC);
        }
    });
}
Cypress.Commands.add('doSkipTutorial', doSkipTutorial);

function runLdapSync(admin: ExternalRequestUser): ChainableT<boolean> {
    return cy.externalRequest({user: admin, method: 'post', path: 'ldap/sync'}).then(() => {
        return cy.waitForLdapSyncCompletion(Date.now(), TIMEOUTS.THREE_MIN).then(() => {
            return cy.wrap(true);
        });
    });
}
Cypress.Commands.add('runLdapSync', runLdapSync);

function getLdapSyncJobStatus(start: number): ChainableT<string> {
    const admin = getAdminAccount();
    return cy.externalRequest({user: admin, method: 'get', path: 'jobs/type/ldap_sync'}).then((result) => {
        const jobs = result.data;
        if (jobs && jobs[0]) {
            if (Math.abs(jobs[0].create_at - start) < TIMEOUTS.TWO_SEC) {
                switch (jobs[0].status) {
                case 'success':
                    return cy.wrap('success');
                case 'pending':
                case 'in_progress':
                    return cy.wrap('pending');
                default:
                    return cy.wrap('unsuccessful');
                }
            }
        }
        return cy.wrap('not found');
    });
}
Cypress.Commands.add('getLdapSyncJobStatus', getLdapSyncJobStatus);

function waitForLdapSyncCompletion(start: number, timeout: number): ChainableT<void> {
    if (Date.now() - start > timeout) {
        throw new Error('Timeout Waiting for LdapSync');
    }

    cy.getLdapSyncJobStatus(start).then((status) => {
        if (status === 'success') {
            return;
        }
        if (status === 'unsuccessful') {
            throw new Error('LdapSync Unsuccessful');
        }

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(TIMEOUTS.FIVE_SEC);
        cy.waitForLdapSyncCompletion(start, timeout);
    });
}
Cypress.Commands.add('waitForLdapSyncCompletion', waitForLdapSyncCompletion);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * getLdapSyncJobStatus is a task that runs an external request for ldap_sync job status
             * @param {number} start - start time of the job.
             * @returns {string} - current status of job
             */
            getLdapSyncJobStatus: typeof getLdapSyncJobStatus;

            /**
             * waitForLdapSyncCompletion is a task that runs recursively
             * until getLdapSyncJobStatus completes or timeouts.
             * @param {number} start - start time of the job.
             * @param {number} timeout - the maxmimum time to wait for the job to complete
             */
            waitForLdapSyncCompletion: typeof waitForLdapSyncCompletion;

            visitLDAPSettings(): ChainableT<void>;

            doLDAPLogin(settings?: PerformLDAPLoginSettings & {siteName?: string}, useEmail?: boolean): ChainableT<void>;

            performLDAPLogin(settings?: PerformLDAPLoginSettings, useEmail?: boolean): ChainableT<void>;

            doLDAPLogout(settings?: {siteName?: string} & CheckLeftSidebarOptions): ChainableT<void>;

            /**
             * runLdapSync is a task that runs an external request to run an ldap sync job.
             * it then waits for the ldap sync job to complete.
             * @param {UserProfile} admin - an admin user
             * @returns {boolean} - true if sync run successfully
             */
            runLdapSync: typeof runLdapSync;

            doSkipTutorial(): ChainableT<void>;
        }
    }
}
