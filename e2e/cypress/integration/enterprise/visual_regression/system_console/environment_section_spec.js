// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @system_console @visual_regression

import * as TIMEOUTS from '../../../../fixtures/timeouts';

describe('System Console - Enterprise', () => {
    const testCases = [
        {
            section: 'Environment',
            header: 'Web Server',
            sidebar: 'Web Server',
            url: 'admin_console/environment/web_server',
        },
        {
            section: 'Environment',
            header: 'Database',
            sidebar: 'Database',
            url: 'admin_console/environment/database',
        },
        {
            section: 'Environment',
            header: 'Elasticsearch',
            sidebar: 'Elasticsearch',
            url: 'admin_console/environment/elasticsearch',
        },
        {
            section: 'Environment',
            header: 'File Storage',
            sidebar: 'File Storage',
            url: 'admin_console/environment/file_storage',
        },
        {
            section: 'Environment',
            header: 'Image Proxy',
            sidebar: 'Image Proxy',
            url: 'admin_console/environment/image_proxy',
        },
        {
            section: 'Environment',
            header: 'SMTP',
            sidebar: 'SMTP',
            url: 'admin_console/environment/smtp',
        },
        {
            section: 'Environment',
            header: 'Push Notification Server',
            sidebar: 'Push Notification Server',
            url: 'admin_console/environment/push_notification_server',
        },
        {
            section: 'Environment',
            header: 'High Availability',
            sidebar: 'High Availability',
            url: 'admin_console/environment/high_availability',
        },
        {
            section: 'Environment',
            header: 'Rate Limiting',
            sidebar: 'Rate Limiting',
            url: 'admin_console/environment/rate_limiting',
        },
        {
            section: 'Environment',
            header: 'Logging',
            sidebar: 'Logging',
            url: 'admin_console/environment/logging',
        },
        {
            section: 'Environment',
            header: 'Session Lengths',
            sidebar: 'Session Lengths',
            url: 'admin_console/environment/session_lengths',
        },
        {
            section: 'Environment',
            header: 'Performance Monitoring',
            sidebar: 'Performance Monitoring',
            url: 'admin_console/environment/performance_monitoring',
        },
        {
            section: 'Environment',
            header: 'Developer Settings',
            sidebar: 'Developer',
            url: 'admin_console/environment/developer',
        },
    ];

    before(() => {
        // * Check if server has license for feature
        cy.apiRequireLicenseForFeature('Elasticsearch');

        // # Go to system admin then verify admin console URL and header
        cy.visit('/admin_console/about/license');
        cy.url().should('include', '/admin_console/about/license');
        cy.get('.admin-console', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').within(() => {
            cy.get('.admin-console__header').should('be.visible').and('have.text', 'Edition and License');
        });
    });

    testCases.forEach((testCase) => {
        it(`${testCase.section} - ${testCase.header}`, () => {
            // # Click the link on the sidebar
            cy.get('.admin-sidebar').should('be.visible').within(() => {
                cy.findByText(testCase.sidebar).scrollIntoView().should('be.visible').click();
            });

            // * Verify that it redirects to the URL and matches with the header
            cy.url().should('include', testCase.url);
            cy.get('.admin-console').should('be.visible').within(() => {
                cy.get('.admin-console__header').should('be.visible').and(testCase.headerContains ? 'contain' : 'have.text', testCase.header);
            });
        });
    });
});
