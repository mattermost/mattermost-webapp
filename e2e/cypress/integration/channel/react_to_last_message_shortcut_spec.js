// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging shortcuts', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    beforeEach(() => {
    // # Making sure there is at least a message without reaction
        cy.postMessage(`Testing keyboard shortcut : ${Date.now()}`);
    });

    it('Should open the emoji picker in the channel view when the focus is not on the center text box', () => {
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

    it('Should open the emoji picker in the channel view when the focus on the center text box', () => {
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

    it('Should not close the emoji picker even shortcut is repeated multiple times', () => {
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
});