// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

import ldapUsers from '../../fixtures/ldap_users.json';
import * as TIMEOUTS from '../../fixtures/timeouts';

const authenticator = require('authenticator');

describe('Settings', () => {
    let mfaUser;
    let samlUser;
    let testSettings;

    const ldapUser = ldapUsers['test-1'];

    before(() => {
        cy.apiInitSetup().
            then(({user}) => {
                mfaUser = user;

                cy.apiUpdateConfig({
                    ServiceSettings: {
                        EnableMultifactorAuthentication: true,
                    },
                });

                // * Check if server has license for LDAP
                cy.apiRequireLicenseForFeature('LDAP');

                // # Test LDAP configuration and server connection
                // # Synchronize user attributes
                cy.apiLDAPTest();
                cy.apiLDAPSync();

                return cy.apiGetConfig();
            }).then(({config}) => {
                testSettings = setLDAPTestSettings(config);
                testSettings.user = ldapUser;
                return cy.doLDAPLogin(testSettings);
            }).then(() => {
                return cy.apiLogout();
            }).then(() => {
                return cy.apiAdminLogin();
            }).then(() => {
                cy.visit('/admin_console');
                return cy.apiCreateUser();
            }).then(({user: user2}) => {
                // # Create SAML user
                samlUser = user2;
                const body = {
                    from: 'email',
                    auto: false,
                };
                body.matches = {};
                body.matches[user2.email] = user2.username;

                return migrateAuthToSAML(body);
            }).then(() => {
                return cy.apiGenerateMfaSecret(mfaUser.id);
            }).then((res) => {
                // # Create MFA user
                const token = authenticator.generateToken(res.code.secret);

                return cy.apiActivateUserMFA(mfaUser.id, true, token);
            });
    });

    it('MM-T953: Verify correct authentication method', () => {
        cy.visit('/admin_console/user_management/users');

        // # Type sysadmin
        cy.get('#searchUsers').clear().type('sysadmin').wait(TIMEOUTS.HALF_SEC);

        // * Verify sign-in method
        cy.findByTestId('userListRow').within(() => {
            cy.get('.more-modal__details').
                should('be.visible').
                and('contain.text', 'Sign-in Method: Email');
        });

        // # Type saml user
        cy.get('#searchUsers').clear().type(samlUser.username).wait(TIMEOUTS.HALF_SEC);

        // * Verify sign-in method
        cy.findByTestId('userListRow').within(() => {
            cy.get('.more-modal__details').
                should('be.visible').
                and('contain.text', 'Sign-in Method: SAML');
        });

        // # Type ldap user
        cy.get('#searchUsers').clear().type(ldapUser.username).wait(TIMEOUTS.HALF_SEC);

        // * Verify sign-in method
        cy.findByTestId('userListRow').within(() => {
            cy.get('.more-modal__details').
                should('be.visible').
                and('contain.text', 'Sign-in Method: LDAP');
        });

        // # Type mfa user
        cy.get('#searchUsers').clear().type(mfaUser.username).wait(TIMEOUTS.HALF_SEC);

        // * Verify sign-in method
        cy.findByTestId('userListRow').within(() => {
            cy.get('.more-modal__details').
                should('be.visible').
                and('contain.text', 'MFA: Yes');
        });
    });

    it('MM-T1149: Hide mobile-specific settings', () => {
        // * Ensure license
        cy.apiRequireLicense();

        // # Visit license page
        cy.visit('/admin_console/about/license');

        // # Remove license
        cy.get('#remove-button').click();

        cy.visit('/admin_console/site_config/file_sharing_downloads');

        // * Check buttons
        cy.get('#adminConsoleWrapper .wrapper--fixed > .admin-console__wrapper').
            should('be.visible').
            and('contain.text', 'Allow File Sharing');

        // Bring back license
        cy.apiRequireLicense();
    });

    it('MM-T1161: Data retention - Settings are saved', () => {
        cy.visit('/admin_console/compliance/data_retention');

        // # Change dropdown
        cy.findByTestId('enableMessageDeletiondropdown').select('Keep messages for a set amount of time');

        // * Verify that button is enabled
        cy.get('#adminConsoleWrapper .wrapper--fixed > .admin-console__wrapper').
            within(() => {
                cy.get('.job-table__panel button').should('be.enabled');
            });

        // # Save setting
        cy.findByTestId('saveSetting').should('be.enabled').click().wait(TIMEOUTS.HALF_SEC);

        // * Confirm that modal shows up
        cy.get('#confirmModalLabel').should('be.visible').should('have.text', 'Confirm data retention policy');
        cy.get('#confirmModalButton').should('be.enabled').click();

        // # Change dropdown
        cy.findByTestId('enableMessageDeletiondropdown').select('Keep all messages indefinitely');

        // * Verify that button is disabled
        cy.get('#adminConsoleWrapper .wrapper--fixed > .admin-console__wrapper').
            within(() => {
                cy.get('.job-table__panel button').should('be.disabled');
            });

        cy.findByTestId('saveSetting').should('be.enabled').click().wait(TIMEOUTS.HALF_SEC);

        // * Confirm that modal shows up
        cy.get('#confirmModalLabel').should('be.visible').should('have.text', 'Confirm data retention policy');
        cy.get('#confirmModalButton').should('be.enabled').click();
    });

    it('MM-T1181: Compliance and Auditing: Run a report, it appears in the job table', () => {
        cy.visit('/admin_console/compliance/monitoring');

        // # Enable compliance reporting
        cy.findByTestId('ComplianceSettings.Enabletrue').click();

        cy.findByTestId('saveSetting').should('be.enabled').click().wait(TIMEOUTS.HALF_SEC);

        // # Fill up the boxes
        cy.get('#desc').clear().type('sample report');
        const now = new Date();
        cy.get('#to').clear().type(now.toLocaleDateString());
        now.setDate(now.getDate() - 1);
        cy.get('#from').clear().type(now.toLocaleDateString());

        // # Run compliance reports
        cy.get('#run-button').click().wait(TIMEOUTS.HALF_SEC);

        cy.findByText('Reload Completed Compliance Reports').click().wait(TIMEOUTS.HALF_SEC);

        // * Ensure that reports appear
        cy.get('.compliance-panel__table tbody').children().should('have.length.greaterThan', 0);

        // * Ensure that the report is correct
        cy.get('.compliance-panel__table tbody tr').first().should('contain.text', 'Download');
        cy.get('.compliance-panel__table tbody tr').first().should('contain.text', 'sample report');
    });

    it('MM-T1635: Channel listing is displayed correctly with proper team name', () => {
        cy.visit('/admin_console/user_management/channels').wait(TIMEOUTS.FIVE_SEC);

        // # Get the team name
        cy.get('#channels .DataGrid .DataGrid_rows > :nth-child(1) > :nth-child(2)').
            invoke('text').
            then((name) => {
                // # Click on the channel
                cy.get('#channels .DataGrid .DataGrid_rows .DataGrid_row').first().click();

                // * Confirm that the team name is same
                cy.get('#channel_profile .channel-team').should('have.text', 'Team' + name);
            });
    });
});

function setLDAPTestSettings(config) {
    return {
        siteName: config.TeamSettings.SiteName,
        siteUrl: config.ServiceSettings.SiteURL,
        teamName: '',
        user: null,
    };
}

function migrateAuthToSAML(body) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/migrate_auth/saml',
        method: 'POST',
        body,
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
