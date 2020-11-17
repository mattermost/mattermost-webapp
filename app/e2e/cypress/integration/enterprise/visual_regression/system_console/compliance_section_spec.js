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

describe('System Console - Compliance', () => {
    const testCases = [
        {
            section: 'Compliance',
            header: 'Data Retention Policy',
            sidebar: 'Data Retention Policy',
            url: 'admin_console/compliance/data_retention',
        },
        {
            section: 'Compliance',
            header: 'Compliance Export (Beta)',
            sidebar: 'Compliance Export (Beta)',
            url: 'admin_console/compliance/export',
        },
        {
            section: 'Compliance',
            header: 'Compliance Monitoring',
            sidebar: 'Compliance Monitoring',
            url: 'admin_console/compliance/monitoring',
            saveOptions: {
                layout: [{selector: '.compliance-panel__table'}],
            },
        },
        {
            section: 'Compliance',
            header: 'Custom Terms of Service (Beta)',
            sidebar: 'Custom Terms of Service (Beta)',
            url: 'admin_console/compliance/custom_terms_of_service',
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

            cy.visualEyesOpen({
                batchName: getBatchName('System Console - Compliance'),
                browser,
            });

            // # Click the link on the sidebar
            cy.get('.admin-sidebar').should('be.visible').within(() => {
                cy.findByText(testCase.sidebar).scrollIntoView().should('be.visible').click();
            });

            // * Verify that it redirects to the URL and matches with the header
            cy.url().should('include', testCase.url);
            cy.get('.admin-console').should('be.visible').within(() => {
                cy.get('.admin-console__header').should('be.visible').and(testCase.headerContains ? 'contain' : 'have.text', testCase.header);
                const otherSaveOptions = testCase.saveOptions ? testCase.saveOptions : {};
                cy.visualSaveSnapshot({
                    tag: testCase.sidebar,
                    target: 'window',
                    fully: true,
                    ...otherSaveOptions,
                });
            });
        });
    });
});
