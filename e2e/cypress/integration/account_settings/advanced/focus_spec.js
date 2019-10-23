// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Advanced', () => {
    before(() => {
        // # Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');

        // # Click the Advanced tab
        cy.get('#advancedButton').click();
    });

    it('focus is in editing the full name', () => {
        const nextFocusIs = (nextSection) => {
            // # open save current section
            cy.focused().click();
            cy.get('#saveSetting').click();

            // * verify next section name is nextSection
            cy.focused().should('have.id', nextSection);
        };

        // * password should be on ctrl+enter to send
        cy.focused().should('have.id', 'advancedCtrlSendEdit');

        // * focus should be on post formatting
        nextFocusIs('formattingEdit');

        // * focus should be on join leave messages
        nextFocusIs('joinLeaveEdit');

        // * focus should be on preview features
        nextFocusIs('advancedPreviewFeaturesEdit');

        // * focus should cycle
        nextFocusIs('advancedCtrlSendEdit');
    });
});