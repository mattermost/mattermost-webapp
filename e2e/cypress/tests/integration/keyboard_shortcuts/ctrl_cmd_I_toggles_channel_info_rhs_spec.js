// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @keyboard_shortcuts

describe('Keyboard Shortcuts', () => {
    let url;

    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({channelUrl}) => {
            url = channelUrl;
        });
    });

    it('MM-T4775 CTRL/CMD+SHIFT+I - Toggle Channel Info RHS', () => {
        // # Visit a test channel
        cy.visit(url);

        // ensure the RHS is not visible
        cy.contains('#rhsContainer', 'Info').should('not.exist');

        // # Press CTRL/CMD+SHIFT+I
        cy.get('body').cmdOrCtrlShortcut('{shift}I');

        // * Ensure RHS is now present
        cy.contains('#rhsContainer', 'Info').should('be.visible');

        // # Press CTRL/CMD+SHIFT+I
        cy.get('body').cmdOrCtrlShortcut('{shift}I');

        // * Ensure RHS is now closed
        cy.contains('#rhsContainer', 'Info').should('not.exist');
    });
});
