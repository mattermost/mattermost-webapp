// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function withTrialBefore(trialed) {
    cy.intercept('GET', '**/api/v4/trial-license/prev', {
        statusCode: 200,
        body: {
            IsLicensed: trialed,
            IsTrial: trialed,
        },
    });
}

function withTrialLicense(trial) {
    cy.intercept('GET', '**/api/v4/license/client?format=old', {
        statusCode: 200,
        body: {
            IsLicensed: 'true',
            IsTrial: trial,
        },
    });
}

describe('Self hosted Pricing modal', () => {
    let urlL;
    let createdUser;

    before(() => {
        cy.apiDeleteLicense('Cloud');
    });

    it('should show Upgrade button in global header for admin users on starter plan', () => {
        cy.apiInitSetup().then(({user, offTopicUrl: url}) => {
            urlL = url;
            createdUser = user;
            cy.apiAdminLogin();
            cy.visit(url);
        });

        // * Check that Upgrade button does not show
        cy.get('#UpgradeButton').should('exist').contains('Upgrade');

        // *Check for Upgrade button tooltip
        cy.get('#UpgradeButton').trigger('mouseover').then(() => {
            cy.get('#upgrade_button_tooltip').should('be.visible').contains('Only visible to system admins');
        });
    });

    it('should not show Upgrade button in global header for non admin users', () => {
        cy.apiLogout();
        cy.apiLogin(createdUser);
        cy.visit(urlL);

        // * Check that Upgrade button does not show
        cy.get('#UpgradeButton').should('not.exist');
    });

    it('should not show Upgrade button for admin users on non trial licensed server', () => {
        // *Ensure the server has trial license
        withTrialBefore('false');
        withTrialLicense('false');

        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // * Open pricing modal
        cy.get('#UpgradeButton').should('not.exist');
    });

    it('Upgrade button should open pricing modal admin users when no trial has ever been added on starter plan', () => {
        // *Ensure the server has had no trial license before
        withTrialBefore('false');

        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // * Open pricing modal
        cy.get('#UpgradeButton').should('exist').click();

        // *Check that starter card Downgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Downgrade');

        // *Check that professional upgrade button is available
        cy.get('#pricingModal').get('#professional').get('#professional_action').should('not.be.disabled').contains('Upgrade');

        // *Check that enteprise trial button is available
        cy.get('#pricingModal').get('#enterprise').get('#start_trial_btn').should('not.be.disabled').contains('Try free for 30 days');
    });

    it('Upgrade button should open pricing modal admin users when the server has requested a trial before on starter plan', () => {
        // *Ensure the server has had no trial license before
        withTrialBefore('true');

        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // * Open pricing modal
        cy.get('#UpgradeButton').should('exist').click();

        // *Check that option to get cloud exists
        cy.get('.alert-option').get('span').contains('Looking for a cloud option?');

        // *Check that starter card Downgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Downgrade');

        // *Check that professional upgrade button is available
        cy.get('#pricingModal').get('#professional').get('#professional_action').should('not.be.disabled').contains('Upgrade');

        // *Check that contact sales button is now showing and not trial button
        cy.get('#pricingModal').get('#enterprise').get('#enterprise_action').should('not.be.disabled').contains('Contact Sales');
    });

    it('Upgrade button should open pricing modal admin users when the server is on a trial', () => {
        // *Ensure the server has trial license
        withTrialBefore('false');
        withTrialLicense('true');

        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit(urlL);

        // * Open pricing modal
        cy.get('#UpgradeButton').should('exist').click();

        // *Check that starter card Downgrade button is disabled
        cy.get('#pricingModal').get('#starter').get('#starter_action').should('be.disabled').contains('Downgrade');

        // *Check that professional upgrade button is available
        cy.get('#pricingModal').get('#professional').get('#professional_action').should('not.be.disabled').contains('Upgrade');

        // *Check that contact sales button is now showing and not trial button
        cy.get('#pricingModal').get('#enterprise').get('#start_trial_btn').should('be.disabled');
    });
});
