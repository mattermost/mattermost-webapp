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
        cy.apiInitSetup({loginAfter: true}).then(({channelUrl}) => {
            // # Visit a test channel
            cy.visit(channelUrl);
        });
    });

    it('MM - T1257 CTRL / CMD + UP or DOWN in RHS', () => {
        // # Reload page
        const firstMessage = 'Hello World!';
        const messages = ['This', 'is', 'an', 'e2e test', '/shrug'];

        cy.reload();

        cy.postMessage(firstMessage);

        cy.getLastPostId().then((postId) => {
            // # Open RHS
            cy.clickPostDotMenu(postId);
            cy.findByText('Reply').click();

            // * Confirm that reply text box has focus
            cy.get('#reply_textbox').should('be.focused');

            // * Confirm the RHS is shown
            cy.get('#rhsCloseButton').should('exist');

            // # Post messages in rhs sidebar
            cy.get('.sidebar-right-container').should('be.visible').within(() => {
                for (let idx = 0; idx < 5; idx++) {
                    cy.findByRole('form', {name: 'reply input region'}).type(messages[idx]);
                    cy.findByTestId('reply_textbox').type('{enter}');

                    // # Clear textbox
                    cy.findByTestId('reply_textbox').clear();
                }
            });

            // * Check if text box is focused
            cy.findByTestId('reply_textbox').should('be.focused');

            // # Clear textbox
            cy.focused().clear();

            // # Press CTRL/CMD + uparrow repeatedly
            for (let idx = 0; idx < 8; idx++) {
                cy.findByTestId('reply_textbox').cmdOrCtrlShortcut('{upArrow}');
                if (idx === 7) {
                    // * Check if the last message is equal to the first message
                    cy.findByTestId('reply_textbox').should('have.text', firstMessage);
                }
            }

            // # Press CTRL/CMD + downarrow
            // * Check if the current text is equal to the second message
            cy.findByTestId('reply_textbox').cmdOrCtrlShortcut('{downArrow}').should('have.text', messages[0]);

            // # Close the rhs bar
            cy.get('#rhsCloseButton').click();

            // # Press CTRL/CMD + uparrow in central textbox
            // * Check if the text is equal to the last message
            cy.findByTestId('post_textbox').cmdOrCtrlShortcut('{upArrow}').should('have.text', messages[4]);

            // # Press CTRL/CMD + downarrow in central textbox
            // * Check if the text is equal to the last message / there is no change in text
            cy.findByTestId('post_textbox').cmdOrCtrlShortcut('{downArrow}').should('have.text', messages[4]);
        });
    });
});
