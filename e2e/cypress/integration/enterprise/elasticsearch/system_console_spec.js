
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Elasticsearch system console', () => {
    before(() => {
        // * Check if server has license for Elasticsearch
        cy.requireLicenseForFeature('Elasticsearch');

        // # Enable Elasticsearch
        cy.apiUpdateConfig({
            ElasticsearchSettings: {
                EnableAutocomplete: true,
                EnableIndexing: true,
                EnableSearching: true,
                Sniff: false,
            },
        });

        // # Login as admin
        cy.apiLogin('sysadmin');

        // # Visit the Elasticsearch settings page
        cy.visit('/admin_console/environment/elasticsearch');

        // * Verify that we can connect to Elasticsearch
        cy.get('#testConfig').find('button').click();
        cy.get('.alert-success').should('have.text', 'Test successful. Configuration saved.');
    });

    it('can purge indexes', () => {
        cy.get('#purgeIndexesSection').within(() => {
            // # Click Purge Indexes button
            cy.contains('button', 'Purge Indexes').click();

            // * We should see a message saying we are successful
            cy.get('.alert-success').should('have.text', 'Indexes purged successfully.');
        });
    });

    it('can perform bulk index', () => {
        // # Click the Index Now button to start the index
        cy.contains('button', 'Index Now').click();

        // # Small wait to ensure new row is added
        cy.wait(TIMEOUTS.TINY);

        // * First row should now say Pending
        cy.get('.job-table__table').
            find('tbody > tr').
            eq(0).
            as('firstRow').
            find('.status-icon-warning', {timeout: TIMEOUTS.LARGE}).
            should('be.visible').
            and('have.text', 'Pending');

        // * First row should update to say In Progress
        cy.get('@firstRow').
            find('.status-icon-warning', {timeout: TIMEOUTS.GIGANTIC}).
            should('be.visible').
            and('have.text', 'In Progress');

        // * First row update to say Success
        cy.waitUntil(() => {
            return cy.get('@firstRow').then((el) => {
                return el.find('.status-icon-success').length > 0;
            });
        }
        , {
            timeout: TIMEOUTS.FOUR_MINS,
            interval: 2000,
            errorMsg: 'Reindex did not succeed in time',
        });

        cy.get('@firstRow').
            find('.status-icon-success').
            should('be.visible').
            and('have.text', 'Success');
    });

    it('autocomplete queries can be disabled', () => {
        //  Check the false checkbox for enable autocomplete
        cy.get('#enableAutocompletefalse').check().should('be.checked');

        // # Save the settings
        cy.get('#saveSetting').click();

        // * Get config from API and verify that EnableAutocomplete setting is false
        cy.apiGetConfig().then((configResponse) => {
            const config = configResponse.body;
            cy.log(config.ElasticsearchSettings);
            expect(config.ElasticsearchSettings.EnableAutocomplete).to.be.false;
        });
    });
});
