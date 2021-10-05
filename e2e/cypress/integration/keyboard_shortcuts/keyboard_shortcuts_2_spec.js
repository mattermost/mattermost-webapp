// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

import * as TIMEOUTS from '../../fixtures/timeouts';
import {isMac} from '../../utils';

describe('Keyboard Shortcuts', () => {
    let testTeam;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testUser = user;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, otherUser.id);
                });
            });
        });
    });

    beforeEach(() => {
        // # Login as admin and visit town-square
        cy.apiAdminLogin();
        cy.visit(`/${testTeam.name}/channels/town-square`);
    });

    it('MM-T1239 - CTRL+/ and CMD+/ and /shortcuts', () => {
        // # Type CTRL/CMD+/
        cy.get('#post_textbox').cmdOrCtrlShortcut('/');

        // # Verify that the 'Keyboard Shortcuts' modal is open
        modalShouldOpen();

        // # Verify that the 'Keyboard Shortcuts' modal displays the CTRL/CMD+U shortcut
        cy.get('.section').eq(2).within(() => {
            cy.findByText('Files').should('be.visible');
            cy.get('.shortcut-line').within(() => {
                if (isMac()) {
                    cy.findByText('⌘').should('be.visible');
                } else {
                    cy.findByText('CTRL').should('be.visible');
                }
                cy.findByText('U').should('be.visible');
            });
        });

        // # Type CTRL/CMD+/ to close the 'Keyboard Shortcuts' modal
        cy.get('body').cmdOrCtrlShortcut('/');
        cy.get('#shortcutsModalLabel').should('not.exist');

        // # Type /shortcuts
        cy.get('#post_textbox').clear().type('/shortcuts{enter}');
        modalShouldOpen();

        // # Close the 'Keyboard Shortcuts' modal using the x button
        cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close').click();
        cy.get('#shortcutsModalLabel').should('not.exist');

        // # Type /shortcuts
        cy.get('#post_textbox').clear().type('/shortcuts{enter}');

        // # Close the 'Keyboard Shortcuts' modal by pressing ESC key
        cy.get('body').type('{esc}');
        cy.get('#shortcutsModalLabel').should('not.exist');
    });

    it('MM-T1254 - CTRL/CMD+UP; CTRL/CMD+DOWN', () => {
        const messagePrefix = 'hello from current user: ';
        let message;
        const count = 5;

        // # Post messages to the center channel
        for (let index = 0; index < count; index++) {
            message = messagePrefix + index;
            cy.postMessage(message);
        }

        for (let index = 0; index < count; index++) {
            // # Type CTRL/CMD+UP
            cy.get('#post_textbox').cmdOrCtrlShortcut('{uparrow}');

            // # Verify that the previous message is displayed
            message = messagePrefix + (4 - index);
            cy.get('#post_textbox').contains(message);
        }

        // # One extra CTRL/CMD+UP does not change the displayed message
        cy.get('#post_textbox').cmdOrCtrlShortcut('{uparrow}');
        message = messagePrefix + '0';
        cy.get('#post_textbox').contains(message);

        for (let index = 1; index < count; index++) {
            // # Type CTRL/CMD+DOWN
            cy.get('#post_textbox').cmdOrCtrlShortcut('{downarrow}');

            // # Verify that the next message is displayed
            message = messagePrefix + index;
            cy.get('#post_textbox').contains(message);
        }
    });

    it('MM-T1260 - UP arrow', () => {
        const message = 'Test';
        const editMessage = 'Edit Test';

        // # Post message text
        cy.get('#post_textbox').clear().type(message).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Edit to the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').clear().type(editMessage).type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        cy.getLastPostId().then((postId) => {
            // * Post should have "Edited"
            cy.get(`#postEdited_${postId}`).
                should('be.visible').
                should('contain', 'Edited');
        });
    });

    it('MM-T1273 - @[character]+TAB', () => {
        const userName = `${testUser.username}`;

        // # Enter the first characters of a user name
        cy.get('#post_textbox').should('be.visible').clear().type('@' + userName.substring(0, 5)).wait(TIMEOUTS.HALF_SEC);

        // # Select the focused on user from the list using TAB
        cy.get('#suggestionList').should('be.visible').within(() => {
            cy.focused().tab();
        });

        // # Verify that the correct user name has been selected
        cy.get('#post_textbox').should('be.visible').should('contain', userName);

        // # Clear the message box
        cy.get('#post_textbox').clear();
    });

    it('MM-T1274 - :[character]+TAB', () => {
        const emojiName = ':tomato';

        // # Enter the first characters of an emoji name
        cy.get('#post_textbox').should('be.visible').clear().type(emojiName.substring(0, 3)).wait(TIMEOUTS.HALF_SEC);

        // # Go down the list of emojis
        cy.get('body').type('{downarrow}').wait(TIMEOUTS.HALF_SEC);
        cy.get('body').type('{downarrow}').wait(TIMEOUTS.HALF_SEC);
        cy.get('body').type('{downarrow}').wait(TIMEOUTS.HALF_SEC);
        cy.get('body').type('{downarrow}').wait(TIMEOUTS.HALF_SEC);

        // # Select the fourth emoji from the top using TAB
        cy.get('#suggestionList').should('be.visible').within(() => {
            cy.focused().tab();
        });

        // # Verify that the correct selection has been made
        cy.get('#post_textbox').should('be.visible').should('contain', emojiName);
    });

    it('MM-T1275 - SHIFT+UP', () => {
        const message = `hello${Date.now()}`;

        // # Post message to center channel
        cy.postMessage(message);

        // # Press SHIFT+UP
        cy.get('#post_textbox').type('{shift}{uparrow}');

        // # Verify that the RHS reply box is focused
        cy.get('#reply_textbox').should('be.focused');

        // * Verify that the recently posted message is shown in the RHS
        cy.getLastPostId().then((postId) => {
            cy.get(`#rhsPostMessageText_${postId}`).should('exist');
        });
    });

    it('MM-T1279 - Keyboard shortcuts menu item', () => {
        // # Click "Keyboard shortcuts" at help menu
        cy.uiOpenHelpMenu('Keyboard shortcuts');

        modalShouldOpen();
    });
});

function modalShouldOpen() {
    const name = isMac() ? /Keyboard Shortcuts ⌘ \// : /Keyboard Shortcuts Ctrl \//;
    cy.findByRole('dialog', {name}).should('be.visible');
}
