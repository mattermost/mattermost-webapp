// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
* Note: This test requires webhook server running. Initiate `npm run start:webhook` to start.
*/

import * as TIMEOUTS from '../../fixtures/timeouts';
import * as MESSAGES from '../../fixtures/messages';
import users from '../../fixtures/users.json';

let channelId;

describe('Messaging shortcuts', () => {
    before(() => {
        cy.apiLogin(users['user-1'].username);
        cy.visit('/');

        cy.getCurrentChannelId().then((id) => {
            channelId = id;
        });
    });

    beforeEach(() => {
    // # Making sure there is at least a message without reaction
        cy.postMessage(MESSAGES.TINY);
    });

    xit('Should open the emoji picker in the channel view when the focus is not on the center text box', () => {
        // # Click anywhere to take focus away from center textbox
        cy.get('#lhsList').within(() => {
            cy.findByText('Town Square').click();
        });
        cy.wait(TIMEOUTS.TINY);

        // # Emulate react to last message shortcut
        cy.get('body').type('{ctrl}{shift}\\');

        // * Check that emoji picker is opened
        cy.get('#emojiPicker').should('exist').within(() => {
            // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).within(() => {
                cy.findByLabelText('reactions').should('exist');
                cy.findByLabelText('remove reaction smile').should('exist');
            });
        });
    });

    xit('Should open the emoji picker in the channel view when the focus on the center text box', () => {
        // # Emulate react to last message shortcut when focus is on the center textbox
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().type('{ctrl}{shift}\\');

        // * Check that emoji picker is opened
        cy.get('#emojiPicker').should('exist').within(() => {
            // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).within(() => {
                cy.findByLabelText('reactions').should('exist');
                cy.findByLabelText('remove reaction smile').should('exist');
            });
        });
    });

    xit('Should not close the emoji picker even shortcut is repeated multiple times', () => {
        // # Click anywhere to take focus away from center textbox
        cy.get('#lhsList').within(() => {
            cy.findByText('Town Square').click();
        });
        cy.wait(TIMEOUTS.TINY);

        // * Picker shoul not be open
        cy.get('#emojiPicker').should('not.exist');

        // # Open picker by keyboard shortcut
        cy.get('body').type('{ctrl}{shift}\\');

        // * Check if emoji picker opened
        cy.get('#emojiPicker').should('exist');

        // # Emulate react to last message shortcut multiple times
        cy.get('body').type('{ctrl}{shift}\\');
        cy.get('body').type('{ctrl}{shift}\\');

        // * Check if multiple times executing same shortcut didnt close picker
        cy.get('#emojiPicker').should('exist');

        // # Close the picker
        cy.get('body').click();

        // * Picker should be closed
        cy.get('#emojiPicker').should('not.exist');

        // * Open with last emoji picker once again,
        cy.get('body').type('{ctrl}{shift}\\');

        // * Check if it can open again
        cy.get('#emojiPicker').should('exist').within(() => {
            // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).within(() => {
                cy.findByLabelText('reactions').should('exist');
                cy.findByLabelText('remove reaction smile').should('exist');
            });
        });
    });

    it('Should add reaction to same post on which emoji picker was opened by shortcut,not on any new messages', () => {
        // # Click anywhere to take focus away from center textbox
        cy.get('#lhsList').within(() => {
            cy.findByText('Town Square').click();
        });
        cy.wait(TIMEOUTS.TINY);

        // # Let the post id which user initially intented to add reactions to, for later use
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('postIdForAddingReaction');
        });

        // # Emulate react to last message shortcut
        cy.get('body').type('{ctrl}{shift}\\');

        // * Check that emoji picker is opened
        cy.get('#emojiPicker').should('exist');

        // # In meanwhile new messages pops up
        cy.postMessageAs({sender: users['user-2'], message: MESSAGES.TINY, channelId});

        // * Check if emoji picker is opened and add a reaction
        cy.get('#emojiPicker').should('exist').within(() => {
            // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        // * Check if the emoji picker has the entered reaction to the message we intented
        cy.get('@postIdForAddingReaction').within(() => {
            cy.findByLabelText('reactions').should('exist');
            cy.findByLabelText('remove reaction smile').should('exist');
        });

        // * Also Check if last message shouldnt have the reaction since we didnt intent to add there
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).within(() => {
                cy.findByLabelText('reactions').should('not.exist');
                cy.findByLabelText('remove reaction smile').should('not.exist');
            });
        });
    });
});