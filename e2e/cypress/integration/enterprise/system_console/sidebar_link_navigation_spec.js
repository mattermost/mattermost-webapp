// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('System Console - Enterprise', () => {
    const testCases = [
        {
            header: 'Groups',
            sidebar: 'Groups',
            url: 'admin_console/user_management/groups',
        },
        {
            header: 'Mattermost Teams',
            sidebar: 'Teams',
            url: 'admin_console/user_management/teams',
        },
        {
            header: 'Mattermost Channels',
            sidebar: 'Channels',
            url: 'admin_console/user_management/channels',
        },
        {
            header: 'Permission Schemes',
            sidebar: 'Permissions',
            url: 'admin_console/user_management/permissions',
        },
        {
            header: 'Elasticsearch',
            sidebar: 'Elasticsearch',
            url: 'admin_console/environment/elasticsearch',
        },
        {
            header: 'High Availability',
            sidebar: 'High Availability',
            url: 'admin_console/environment/high_availability',
        },
        {
            header: 'Performance Monitoring',
            sidebar: 'Performance Monitoring',
            url: 'admin_console/environment/performance_monitoring',
        },
        {
            header: 'Announcement Banner',
            sidebar: 'Announcement Banner',
            url: 'admin_console/site_config/announcement_banner',
        },
        {
            header: 'AD/LDAP',
            sidebar: 'AD/LDAP',
            url: 'admin_console/authentication/ldap',
        },
        {
            header: 'SAML 2.0',
            sidebar: 'SAML 2.0',
            url: 'admin_console/authentication/saml',
        },
        {
            header: 'OAuth 2.0',
            sidebar: 'OAuth 2.0',
            url: 'admin_console/authentication/oauth',
        },
        {
            header: 'Guest Access (Beta)',
            sidebar: 'Guest Access (Beta)',
            url: 'admin_console/authentication/guest_access',
        },
        {
            header: 'Data Retention Policy',
            sidebar: 'Data Retention Policy',
            url: 'admin_console/compliance/data_retention',
        },
        {
            header: 'Compliance Export (Beta)',
            sidebar: 'Compliance Export (Beta)',
            url: 'admin_console/compliance/export',
        },
        {
            header: 'Compliance Monitoring',
            sidebar: 'Compliance Monitoring',
            url: 'admin_console/compliance/monitoring',
        },
        {
            header: 'Custom Terms of Service (Beta)',
            sidebar: 'Custom Terms of Service (Beta)',
            url: 'admin_console/compliance/custom_terms_of_service',
        },
    ];

    before(() => {
        // * Check if server has license
        cy.apiRequireLicense();

        const newSettings = {
            TeamSettings: {SiteName: 'Mattermost'},
        };
        cy.apiUpdateConfig(newSettings);

        // # Go to system admin then verify admin console URL and header
        cy.visit('/admin_console/about/license');
        cy.url().should('include', '/admin_console/about/license');
        cy.get('.admin-console', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').within(() => {
            cy.get('.admin-console__header').should('be.visible').and('have.text', 'Edition and License');
        });
    });

    beforeEach(() => {
        // # Click on "Edition and License"
        cy.get('.admin-sidebar').should('be.visible').within(() => {
            cy.findByText('Edition and License').scrollIntoView().should('be.visible').click();
        });

        // * Verify that it redirects to the URL and matches with the header
        cy.url().should('include', '/admin_console/about/license');
        cy.get('.admin-console').should('be.visible').within(() => {
            cy.get('.admin-console__header').should('be.visible').and('have.text', 'Edition and License');
        });
    });

    testCases.forEach((testCase) => {
        it(`can navigate to ${testCase.header}`, () => {
            // # Click the link on the sidebar
            cy.get('.admin-sidebar').should('be.visible').within(() => {
                cy.findByText(testCase.sidebar).scrollIntoView().should('be.visible').click();
            });

            // * Verify that it redirects to the URL and matches with the header
            cy.url().should('include', testCase.url);
            cy.get('.admin-console').should('be.visible').within(() => {
                cy.get('.admin-console__header').should('be.visible').and('have.text', testCase.header);
            });
        });
    });
});
