// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Sidebar > General', () => {
    before(() => {
        // # Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');
    });

    it('focus is in editing the full name', () => {
        const nextFocusIs = (nextSection) => {
            // # open save current section
            cy.focused().click();
            cy.get('#saveSetting').click();

            // * verify next section name is nextSection
            cy.focused().should('have.id', nextSection);
        };

        // # Check general tab is rendered
        cy.get('#generalButton').should('be.visible');

        // * editing the full name should have focus
        cy.focused().should('have.id', 'nameEdit');

        // * move to next focus and check it is the username
        nextFocusIs('usernameEdit');

        // * focus should be on username edition
        nextFocusIs('nicknameEdit');

        // * focus should be on position edition
        nextFocusIs('positionEdit');

        // * focus should be on email edition
        nextFocusIs('emailEdit');

        // * focus should be on profile edition
        // email requires extra steps
        cy.focused().click();
        cy.get('#cancelSetting').click();
        cy.focused().should('have.id', 'pictureEdit');

        // * test for circling the focus
        // picture requires extra steps and it's rendered differently
        cy.focused().click();
        cy.contains('Cancel').click();
        cy.focused().should('have.id', 'nameEdit');
    });
});