// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('System Console - Enterprise', () => {
    before(() => {
        // * Check if server has license
        cy.requireLicense();

        const newSettings = {
            TeamSettings: {SiteName: 'Mattermost'},
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as System Admin
        cy.apiLogin('sysadmin');

        cy.visit('/ad-1/channels/town-square');
    });

    const testCases = [
        {
            header: 'Groups (Beta)',
            sidebar: 'Groups (Beta)',
            url: 'admin_console/user_management/groups',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Mattermost Teams',
            sidebar: 'Teams',
            url: 'admin_console/user_management/teams',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Mattermost Channels',
            sidebar: 'Channels',
            url: 'admin_console/user_management/channels',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Permission Schemes',
            sidebar: 'Permissions',
            url: 'admin_console/user_management/permissions',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Elasticsearch',
            sidebar: 'Elasticsearch',
            url: 'admin_console/environment/elasticsearch',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'High Availability',
            sidebar: 'High Availability',
            url: 'admin_console/environment/high_availability',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Performance Monitoring',
            sidebar: 'Performance Monitoring',
            url: 'admin_console/environment/performance_monitoring',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Announcement Banner',
            sidebar: 'Announcement Banner',
            url: 'admin_console/site_config/announcement_banner',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'AD/LDAP',
            sidebar: 'AD/LDAP',
            url: 'admin_console/authentication/ldap',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'SAML 2.0',
            sidebar: 'SAML 2.0',
            url: 'admin_console/authentication/saml',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'OAuth 2.0',
            sidebar: 'OAuth 2.0',
            url: 'admin_console/authentication/oauth',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Guest Access (Beta)',
            sidebar: 'Guest Access (Beta)',
            url: 'admin_console/authentication/guest_access',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Data Retention Policy',
            sidebar: 'Data Retention Policy',
            url: 'admin_console/compliance/data_retention',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Compliance Export (Beta)',
            sidebar: 'Compliance Export (Beta)',
            url: 'admin_console/compliance/export',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Compliance Monitoring',
            sidebar: 'Compliance Monitoring',
            url: 'admin_console/compliance/monitoring',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Custom Terms of Service (Beta)',
            sidebar: 'Custom Terms of Service (Beta)',
            url: 'admin_console/compliance/custom_terms_of_service',
            otherUrl: 'admin_console/about/license',
        },
    ];

    testCases.forEach((testCase) => {
        it(`can navigate to ${testCase.header}`, () => {
            // # Visit the URL directly
            cy.visit(testCase.url);

            // * Verify that the header is correct
            cy.get('.admin-console').should('be.visible').within(() => {
                cy.get('.admin-console__header').should('be.visible').and('have.text', testCase.header);
            });

            // # Visit other URL and click the link on the sidebar
            cy.visit(testCase.otherUrl);
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
