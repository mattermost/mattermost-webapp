// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

describe('Keyboard Shortcuts', () => {
    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            // # Visit a test channel
            cy.visit(offTopicUrl);
            cy.postMessage('Hello World');
        });
    });

    it('MM-T1277 SHIFT+UP', () => {
        // # Press shift+up to open the latest thread in the channel in the RHS
        cy.get('#post_textbox').type('{shift}{uparrow}');

        // * RHS Opens up
        cy.get('.sidebar--right__header').should('be.visible');

        // * RHS textbox should be focused
        cy.get('#reply_textbox').should('be.focused');

        // # Click into the post textbox in the center channel
        cy.get('#post_textbox').click();

        // # Press shift+up again
        cy.get('#post_textbox').type('{shift}{uparrow}');

        // * RHS textbox should be focused
        cy.get('#reply_textbox').should('be.focused');
    });
});
