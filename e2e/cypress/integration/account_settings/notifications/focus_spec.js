// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Sidebar > Notifications', () => {
    before(() => {
        // # Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');

        // # Click the Notifications tab
        cy.get('#notificationsButton').click();
    });

    it('focus is in editing the full name', () => {
        const nextFocusIs = (nextSection) => {
            // # open save current section
            cy.focused().click();
            cy.get('#saveSetting').click();

            // * verify next section name is nextSection
            cy.focused().should('have.id', nextSection);
        };

        // * focus should be on desktop notifications
        cy.focused().should('have.id', 'desktopEdit');

        // * focus should be on email notifications
        nextFocusIs('emailEdit');

        // * focus should be on mobile notifications
        nextFocusIs('pushEdit');

        // * focus should be on words to trigger mentions
        nextFocusIs('keysEdit');

        // * focus should be on reply notifications
        nextFocusIs('commentsEdit');

        // * focus should cycle
        nextFocusIs('desktopEdit');
    });
});