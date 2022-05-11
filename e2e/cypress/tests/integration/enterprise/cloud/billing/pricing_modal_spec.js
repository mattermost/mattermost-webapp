// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Pricing modal', () => {
    let urlL;

    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    it('should not show Upgrade button in global header for non admin users', () => {
        cy.apiInitSetup().then(({user, offTopicUrl: url}) => {
            urlL = url;
            cy.apiLogin(user);
            cy.visit(url);
        });

        // * Check that Upgrade button does not show
        cy.get('#UpgradeButton').should('not.exist');
    });

    it('should not show Upgrade button in global header for non admin users', () => {
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // * Check that Upgrade button shows for admins
        cy.get('#UpgradeButton').should('exist');
    });

    it('should open pricing modal when Upgrade button clicked', () => {
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // # Open the pricing modal
        cy.get('#UpgradeButton').should('exist').click();
    });
});
