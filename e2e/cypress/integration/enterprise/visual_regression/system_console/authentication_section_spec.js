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

import {getBatchName} from '../helpers';

describe('System Console - Authentication', () => {
    const testCases = [
        {
            section: 'Authentication',
            header: 'Signup',
            sidebar: 'Signup',
            url: 'admin_console/authentication/signup',
        },
        {
            section: 'Authentication',
            header: 'Email Authentication',
            sidebar: 'Email',
            url: 'admin_console/authentication/email',
        },
        {
            section: 'Authentication',
            header: 'Password',
            sidebar: 'Password',
            url: 'admin_console/authentication/password',
        },
        {
            section: 'Authentication',
            header: 'Multi-factor Authentication',
            sidebar: 'MFA',
            url: 'admin_console/authentication/mfa',
        },
        {
            section: 'Authentication',
            header: 'AD/LDAP',
            sidebar: 'AD/LDAP',
            url: 'admin_console/authentication/ldap',
            openOptions: {
                browser: {width: 1024, height: 4850, name: 'chrome'},
            },
        },
        {
            section: 'Authentication',
            header: 'SAML 2.0',
            sidebar: 'SAML 2.0',
            url: 'admin_console/authentication/saml',
            openOptions: {
                browser: {width: 1024, height: 4100, name: 'chrome'},
            },
        },
        {
            section: 'Authentication',
            header: 'OAuth 2.0',
            sidebar: 'OAuth 2.0',
            url: 'admin_console/authentication/oauth',
        },
        {
            section: 'Authentication',
            header: 'Guest Access (Beta)',
            sidebar: 'Guest Access (Beta)',
            url: 'admin_console/authentication/guest_access',
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

    afterEach(() => {
        cy.visualEyesClose();
    });

    testCases.forEach((testCase) => {
        it(`${testCase.section} - ${testCase.header}`, () => {
            const browser = [{width: 1024, height: 2100, name: 'chrome'}];
            const otherOpenOptions = testCase.openOptions ? testCase.openOptions : {};

            cy.visualEyesOpen({
                batchName: getBatchName('System Console - Authentication'),
                browser,
                ...otherOpenOptions,
            });

            // # Click the link on the sidebar
            cy.get('.admin-sidebar').should('be.visible').within(() => {
                cy.findByText(testCase.sidebar).scrollIntoView().should('be.visible').click();
            });

            // * Verify that it redirects to the URL and matches with the header
            cy.url().should('include', testCase.url);
            cy.get('.admin-console').should('be.visible').within(() => {
                cy.get('.admin-console__header').should('be.visible').and(testCase.headerContains ? 'contain' : 'have.text', testCase.header);

                // # Save snapshot for visual testing
                cy.visualSaveSnapshot({tag: testCase.sidebar, target: 'window', fully: true});
            });
        });
    });
});
