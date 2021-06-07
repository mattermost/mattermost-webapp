// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import * as TIMEOUTS from '../../../../fixtures/timeouts';

describe('Account Settings - Save Theme', () => {
    before(() => {
        // # Login as new user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T2090 Theme Colors: New theme color is saved', () => {
        // # Go to Account Settings
        cy.toAccountSettingsModal();

        // # Go to Theme settings tab
        cy.get('#displayButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        cy.get('#themeTitle', {timeout: TIMEOUTS.TWO_SEC}).should('be.visible').click();

        // # Change to dark theme
        cy.get('#premadeThemeMattermostDark').should('not.have.class', 'active').click();
        cy.get('#premadeThemeMattermostDark').should('have.class', 'active');
        cy.get('#saveSetting').click({force: true});

        // # Close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // # Go to Account Settings
        cy.toAccountSettingsModal();

        // # Go to Theme settings tab
        cy.get('#displayButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        cy.get('#themeTitle', {timeout: TIMEOUTS.TWO_SEC}).should('be.visible').click();

        // * Verify dark theme is selected
        cy.get('#premadeThemeMattermostDark').should('have.class', 'active');
    });
});
