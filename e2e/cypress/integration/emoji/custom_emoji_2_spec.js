// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @emoji

import * as TIMEOUTS from '../../fixtures/timeouts';

import {getCustomEmoji, verifyLastPostedEmoji} from './helpers';

describe('Custom emojis', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let townsquareLink;

    const largeEmojiFile = 'gif-image-file.gif';
    const largeEmojiFileResized = 'gif-image-file-resized.gif';
    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableCustomEmoji: true,
            },
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin();

        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
            townsquareLink = `/${team.name}/channels/town-square`;
        });

        cy.apiCreateUser().then(({user: user1}) => {
            otherUser = user1;
            cy.apiAddUserToTeam(testTeam.id, otherUser.id);
        }).then(() => {
            cy.apiLogin(testUser);
            cy.visit(townsquareLink);
        });
    });

    it('MM-T2184 Custom emoji - filter list', () => {
        const {customEmojiWithColons} = getCustomEmoji();

        const emojiNameForSearch1 = 'alabala';
        const emojiNameForSearch2 = customEmojiWithColons;

        // # Open custom emoji
        cy.uiOpenCustomEmoji();

        // # Click on add new emoji
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile).wait(TIMEOUTS.THREE_SEC);

        // # Click on Save
        cy.uiSave().wait(TIMEOUTS.THREE_SEC);

        // # Go back to home channel
        cy.findByText('Back to Mattermost').should('exist').and('be.visible').click().wait(TIMEOUTS.FIVE_SEC);

        // # Open emoji picker
        cy.uiOpenEmojiPicker();

        // # Search for a missing emoji in emoji picker
        cy.findByTestId('emojiInputSearch').should('be.visible').type(emojiNameForSearch1);

        // * Get list of emojis based on search text
        cy.get('.no-results__title').should('be.visible').and('have.text', 'No results for "' + emojiNameForSearch1 + '"');

        // # Search for an existing emoji
        cy.findByTestId('emojiInputSearch').should('be.visible').clear().type(emojiNameForSearch2);

        // * Get list of emojis based on search text
        cy.findAllByTestId('emojiItem').children().should('have.length', 1);
        cy.findAllByTestId('emojiItem').children('img').first().should('have.class', 'emoji-category--custom');
    });

    it('MM-T2185 Custom emoji - renders immediately for other user Custom emoji - renders after logging out and back in', () => {
        const {customEmojiWithColons} = getCustomEmoji();

        // # Open custom emoji
        cy.uiOpenCustomEmoji();

        // # Click on add new emoji
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile).wait(TIMEOUTS.THREE_SEC);

        // # Click on Save
        cy.uiSave().wait(TIMEOUTS.THREE_SEC);

        // # Go back to home channel
        cy.findByText('Back to Mattermost').should('exist').and('be.visible').click().wait(TIMEOUTS.FIVE_SEC);

        // # Post a message with the emoji
        cy.postMessage(customEmojiWithColons);

        // # User2 logs in
        cy.apiLogin(otherUser);

        // # Navigate to a channel
        cy.visit(townsquareLink);

        // * The emoji should be displayed in the post
        verifyLastPostedEmoji(customEmojiWithColons, largeEmojiFileResized);

        // # User1 logs in
        cy.apiLogin(testUser);

        // # Navigate to a channel
        cy.visit(townsquareLink);

        // * The emoji should be displayed in the post
        verifyLastPostedEmoji(customEmojiWithColons, largeEmojiFileResized);
    });
});
