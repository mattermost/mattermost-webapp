// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @keyboard_shortcuts

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Keyboard Shortcuts', () => {
    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({channelUrl}) => {
            // # Visit a test channel
            cy.visit(channelUrl);
        });
    });

    describe('Keyboard Shortcuts', () => {
        it('MM-T1243 CTRL/CMD+K - Open public channel using arrow keys and Enter, click out of current channel message box first', () => {
            // To remove focus from message text box
            cy.get('#postListContent').click();
            cy.get('#post_textbox').should('not.be.focused');

            cy.get('body').cmdOrCtrlShortcut('K');
            cy.get('#quickSwitchInput').type('T');

            cy.wait(TIMEOUTS.HALF_SEC);
            cy.get('body').type('{downarrow}');

            cy.get('#suggestionList').findByTestId('off-topic').should('be.visible').and('have.class', 'suggestion--selected');

            cy.get('body').type('{enter}');
            cy.contains('#channelHeaderTitle', 'Off-Topic');
            cy.get('#post_textbox').should('be.focused');
        });
    });
});
