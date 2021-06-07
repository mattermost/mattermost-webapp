// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @not_cloud @system_console

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('System Console - Non-Enterprise', () => {
    const testCases = [
        {
            header: 'Web Server',
            sidebar: 'Web Server',
            url: 'admin_console/environment/web_server',
        },
        {
            header: 'Database',
            sidebar: 'Database',
            url: 'admin_console/environment/database',
        },
        {
            header: 'Image Proxy',
            sidebar: 'Image Proxy',
            url: 'admin_console/environment/image_proxy',
        },
    ];

    before(() => {
        cy.shouldNotRunOnCloudEdition();

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
            cy.get('.admin-sidebar', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
                cy.findByText(testCase.sidebar).scrollIntoView().should('be.visible').click();
            });

            // * Verify that it redirects to the URL and matches with the header
            cy.url().should('include', testCase.url);
            cy.get('.admin-console', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
                cy.get('.admin-console__header').should('be.visible').and(testCase.headerContains ? 'contain' : 'have.text', testCase.header);
            });
        });
    });

    it('can go to admin console by clicking System Console', () => {
        // # Go to default team/channel
        cy.visit('/');

        // # Click on "Main Menu"
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();

        // # Click on "System Console"
        cy.get('.Menu__content').should('be.visible').within(() => {
            cy.findByText('System Console').should('be.visible').click();
        });

        // * Verify that it redirects to "Edition and License" system console page
        cy.url().should('include', '/admin_console/about/license');
        cy.get('.admin-console', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
            cy.get('.admin-console__header').should('be.visible').and('have.text', 'Edition and License');
        });
    });
});
