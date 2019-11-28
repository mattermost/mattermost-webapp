// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../../fixtures/timeouts';

module.exports = {
    withTimestamp: (string, timestamp) => {
        return string + '-' + timestamp;
    },
    createEmail: (name, timestamp) => {
        return name + timestamp + '@sample.mattermost.com';
    },
    enableElasticSearch: () => {
        // Enabled elastic search via the API
        cy.apiUpdateConfig({
            ElasticsearchSettings: {
                EnableAutocomplete: true,
                EnableIndexing: true,
                EnableSearching: true,
                Sniff: false,
            },
        });

        cy.apiLogin('sysadmin');

        // Navigate to the elastic search setting page
        cy.visit('/admin_console/environment/elasticsearch');

        // Test the connection and verify that we are successful
        cy.contains('button', 'Test Connection').click();
        cy.get('.alert-success').should('have.text', 'Test successful. Configuration saved.');

        // Index so we are up to date
        cy.contains('button', 'Index Now').click();

        // Small wait to ensure new row is added
        cy.wait(TIMEOUTS.TINY);

        cy.get('.job-table__table').find('tbody > tr').eq(0).as('firstRow').find('.status-icon-warning', {timeout: TIMEOUTS.GIGANTIC}).should('be.visible');

        // Newest row should eventually result in Success
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
    },
    disableElasticSearch: () => {
        // Disable elastic search via API
        cy.apiUpdateConfig({
            ElasticsearchSettings: {
                EnableAutocomplete: false,
                EnableIndexing: false,
                EnableSearching: false,
                Sniff: false,
            },
        });
    },
};