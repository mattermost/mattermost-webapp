// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @cloud_only @cloud_trial
// Skip:  @headless @electron // run on Chrome (headed) only

const dayJs = require('dayjs');

describe('System Console - Billing History section', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        // # Visit the billing history url
        cy.visit('admin_console/billing/billing_history');

        // * Check for billing history header
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Billing History');
    });

    it('MM-37053 Finding the default "Cloud Starter" record in billing history screen', () => {
        const currentDate = new Date();

        // * Check for default record in grid
        cy.contains('td:nth-of-type(1) span', dayJs(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)).format('MM/DD/YYYY')).should('exist');
        cy.contains('td:nth-of-type(2) div', 'Cloud Starter').should('exist');
        cy.contains('td:nth-of-type(3) span', '$0.00').should('exist');
        cy.contains('td:nth-of-type(4) span', 'Paid').should('exist');
    });

    it('MM-37053 Validating the content of downloaded PDF in the billing history screen', () => {
        // * Check for default record's length in grid
        cy.get('.BillingHistory__table-row').should('have.length', 1);

        // * Check the content from the downloaded pdf file
        cy.get('.BillingHistory__table-invoice >a').then((link) => {
            cy.request({
                url: link.prop('href'),
                encoding: 'binary',
            }).then(
                (response) => {
                    const fileName = 'invoice';
                    const filePath = Cypress.config('downloadsFolder') + '/' + fileName + '.pdf';
                    cy.writeFile(filePath, response.body, 'binary');
                    cy.task('getPdfContent', filePath).then((data) => {
                        const allLines = data.text.split('\n');
                        const prodLine = allLines.filter((lineObj) => lineObj.search('Trial period for Cloud Starter') !== -1);
                        expect(prodLine.length).to.be.equal(1);
                        const amountLine = allLines.filter((lineObj) => lineObj.search('Amount paid') !== -1);
                        expect(amountLine[0].includes('$0.00')).to.be.equal(true);
                    });
                },
            );
        });
    });
});

