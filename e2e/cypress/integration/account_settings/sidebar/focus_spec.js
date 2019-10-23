// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Sidebar', () => {
    before(() => {
        // # Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');

        // # Click the Sidebar tab
        cy.get('#sidebarButton').click();
    });

    it('focus is in editing the full name', () => {
        const nextFocusIs = (nextSection) => {
            // # open save current section
            cy.focused().click();
            cy.get('#saveSetting').click();

            // * verify next section name is nextSection
            cy.focused().should('have.id', nextSection);
        };

        // * focus on channel grouping
        cy.focused().should('have.id', 'groupChannelsEdit');

        // * focus on channel switcher
        nextFocusIs('channelSwitcherEdit');

        // * focus should cycle
        nextFocusIs('groupChannelsEdit');
    });
});