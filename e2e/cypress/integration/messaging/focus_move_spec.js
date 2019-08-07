// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M15406 - Focus move from Recent Mentions to main input box when a character key is selected', () => {
        //#Click the flag icon to open the flagged posts RHS to move the focus out of the main input box
        cy.get('#channelHeaderFlagButton').click();

        //#Making sure Flagged Posts is present on the page
        cy.contains('Flagged Posts').should('be.visible');
        cy.get('#post_textbox').should('not.be.focused');

        //#Push a character key such as "A"
        cy.get('body').type('A');

        //#Expect to have "A" value in main input
        cy.get('#post_textbox').should('be.focused');

        //#Click the @ icon to open the Recent mentions RHS to move the focus out of the main input box
        cy.get('#channelHeaderMentionButton').click();
        cy.get('#post_textbox').should('not.be.focused');

        //#Push a character key such as "B"
        cy.get('body').type('B');
        cy.get('#post_textbox').should('be.focused');
    });
});
