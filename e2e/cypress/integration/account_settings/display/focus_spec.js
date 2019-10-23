// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Display', () => {
    before(() => {
        // # Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');

        // # Click the Display tab
        cy.get('#displayButton').click();
    });

    it('focus is in editing the full name', () => {
        const nextFocusIs = (nextSection) => {
            // # open save current section
            cy.focused().click();
            cy.get('#saveSetting').click();

            // * verify next section name is nextSection
            cy.focused().should('have.id', nextSection);
        };

        // * editing theme should have focus
        cy.focused().should('have.id', 'themeEdit');

        // * move to next focus and check it is the clock
        nextFocusIs('clockEdit');

        // * focus should be how to display names
        nextFocusIs('name_formatEdit');

        // * focus should be on link previews
        nextFocusIs('linkpreviewEdit');

        // * focus should be on image display
        nextFocusIs('collapseEdit');

        // * focus should be on how to display messages
        nextFocusIs('message_displayEdit');

        // * focus should be on how to display a channel
        nextFocusIs('channel_display_modeEdit');

        // * focus should be on language
        nextFocusIs('languagesEdit');

        // * focus cycles
        nextFocusIs('themeEdit');

    });
});