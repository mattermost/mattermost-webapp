// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

import * as TIMEOUTS from '../../fixtures/timeouts';

function uiEnableComplianceExport(exportFormat = 'csv'): ChainableT<void> {
    // # Enable compliance export
    cy.findByRole('radio', {name: /true/i}).click();

    // # Change export format
    cy.findByRole('combobox', {name: /export format:/i}).select(exportFormat);

    // # Save settings
    cy.findByRole('button', {name: /save/i}).as('saveButton');
    cy.get('@saveButton').click();

    cy.waitUntil(() => cy.get('@saveButton').then((el) => {
        return el[0].innerText === 'Save';
    }));
    return;
}
Cypress.Commands.add('uiEnableComplianceExport', uiEnableComplianceExport);

function uiGoToCompliancePage(): ChainableT<void> {
    cy.visit('/admin_console/compliance/export');
    cy.get('.admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Compliance Export');
    return;
}
Cypress.Commands.add('uiGoToCompliancePage', uiGoToCompliancePage);

function uiExportCompliance(): ChainableT<void> {
    // # Click the export job button
    cy.findByRole('button', {name: /run compliance export job now/i}).click();

    // # Small wait to ensure new row is add
    cy.wait(TIMEOUTS.THREE_SEC);

    // # Get the first row
    cy.get('.job-table__table').find('tbody > tr').eq(0).as('firstRow');

    // # Get the first table header
    cy.get('.job-table__table').find('thead > tr').as('firstheader');

    // # Wait until export is finished
    cy.waitUntil(() => {
        return cy.get('@firstRow').find('td:eq(1)').then((el) => {
            return el[0].innerText.trim() === 'Success';
        });
    },
    {
        timeout: TIMEOUTS.FIVE_MIN,
        interval: TIMEOUTS.ONE_SEC,
        errorMsg: 'Compliance export did not finish in time',
    });
    return;
}
Cypress.Commands.add('uiExportCompliance', uiExportCompliance);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Select compliance export format
             * @param {string} exportFormat - compliance export format
             *
             * @example
             *   const EXPORTFORMAT = "Actiance XML";
             *   cy.uiEnableComplianceExport(Compliance Export Format);
             */
            uiEnableComplianceExport: typeof uiEnableComplianceExport;

            /**
             * Go to Compliance Page
             */
            uiGoToCompliancePage: typeof uiGoToCompliancePage;

            /**
             * Click Run Export Compliance and wait for Success status
             */
            uiExportCompliance: typeof uiExportCompliance;
        }
    }
}
