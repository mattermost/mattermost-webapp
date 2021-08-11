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

        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });

        gotoBillingHistoryScreen();
    });

    it('MM-37053 - Finding the default "Cloud Starter" record in Billing History screen', () => {
        const currentDate = new Date();

        // * check for default record in grid
        cy.contains('td span', dayJs(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)).format('MM/DD/YYYY')).should('exist');
        cy.contains('td div', 'Cloud Starter').should('exist');
        cy.contains('td span', '$0.00').should('exist');
        cy.contains('td span', 'Paid').should('exist');
    });

    it('MM-37053 - Validating the content of downloaded PDF in the Billing History screen', () => {
        // * check for default record's length in grid
        cy.get('.BillingHistory__table-row').should('have.length', 1);

        // * check the content from the downloaded pdf file
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

const gotoBillingHistoryScreen = () => {
    // # navigating to Billing History Screen
    cy.get('.sidebar-header-dropdown__icon').click();
    cy.findByText('System Console').should('be.visible').click();
    cy.findByText('Billing History').should('be.visible').click();
};

