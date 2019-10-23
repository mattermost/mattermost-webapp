// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Security', () => {
    before(() => {
        // # Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');

        // # Click the Security tab
        cy.get('#securityButton').click();
    });

    it('focus is in editing the full name', () => {
        const nextFocusIs = (nextSection) => {
            // # open save current section

            // on security we always cancel
            cy.focused().click();
            cy.get('#cancelSetting').click();

            // * verify next section name is nextSection
            cy.focused().should('have.id', nextSection);
        };

        // * password should have focus
        cy.focused().should('have.id', 'passwordEdit');

        // * move to next focus and check it is Oauth
        nextFocusIs('appsEdit');

        // * focus should cycle
        nextFocusIs('passwordEdit');
    });
});