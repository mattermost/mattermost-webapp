// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @not_cloud @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('System Console - Enterprise', () => {
    const testCases = [
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
    ];

    before(() => {
        cy.shouldNotRunOnCloudEdition();

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
