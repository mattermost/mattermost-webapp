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

import {getCustomEmoji} from './helpers';

describe('Custom emojis', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let townsquareLink;

    const builtinEmoji = 'taco';
    const builtinEmojiWithColons = ':taco:';
    const builtinEmojiUppercaseWithColons = ':TAco:';
    const largeEmojiFile = 'gif-image-file.gif';

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

    it('MM-T2186 Emoji picker - default and custom emoji reaction, case-insensitive', () => {
        const {customEmoji, customEmojiWithColons} = getCustomEmoji();

        const messageText = 'test message';

        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.findByText('Custom Emoji').should('be.visible').click();

        // # Click on add new emoji
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile);

        // # Click on Save
        cy.get('.backstage-form__footer').findByText('Save').click().wait(TIMEOUTS.FIVE_SEC);

        // # Go back to home channel
        cy.findByText('Back to Mattermost').should('exist').and('be.visible').click().wait(TIMEOUTS.FIVE_SEC);

        // # Post a message
        cy.postMessage(messageText);

        // # Post the built-in emoji
        cy.get('#post_textbox').type('+' + builtinEmojiWithColons).wait(TIMEOUTS.HALF_SEC).type('{enter}').type('{enter}');

        cy.getLastPostId().then((postId) => {
            const postText = `#postMessageText_${postId}`;
            cy.get(postText).should('have.text', messageText);

            cy.clickPostReactionIcon(postId);

            // # Search emoji name text in emoji searching input
            cy.findByTestId('emojiInputSearch').should('be.visible').type(builtinEmojiUppercaseWithColons);

            // * Get list of emojis based on the search text
            cy.findAllByTestId('emojiItem').children().should('have.length', 1);

            // # Select the builtin emoji
            cy.findAllByTestId('emojiItem').children().click();

            // # Search for the custom emoji
            cy.clickPostReactionIcon(postId);

            // # Search first three letters of the emoji name text in emoji searching input
            cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmoji.substring(0, 10));

            // * Get list of emojis based on the search text
            cy.findAllByTestId('emojiItem').children().should('have.length', 1);
            cy.findAllByTestId('emojiItem').children('img').first().should('have.class', 'emoji-category--custom');

            // * Select the custom emoji
            cy.findAllByTestId('emojiItem').children().click();
        });

        cy.getLastPostId().then((postId) => {
            cy.get(`#postReaction-${postId}-` + builtinEmoji).should('be.visible');
            cy.get(`#postReaction-${postId}-` + customEmoji).should('be.visible');
        });

        cy.reload();

        cy.getLastPostId().then((postId) => {
            cy.get(`#postReaction-${postId}-` + builtinEmoji).should('be.visible');
            cy.get(`#postReaction-${postId}-` + customEmoji).should('be.visible');
        });
    });

    it('MM-T2187 Custom emoji reaction', () => {
        const {customEmoji, customEmojiWithColons} = getCustomEmoji();

        const messageText = 'test message';

        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.findByText('Custom Emoji').should('be.visible').click();

        // # Click on add new emoji
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile);

        // # Click on Save
        cy.get('.backstage-form__footer').findByText('Save').click().wait(TIMEOUTS.FIVE_SEC);

        // # Go back to home channel
        cy.findByText('Back to Mattermost').should('exist').and('be.visible').click().wait(TIMEOUTS.FIVE_SEC);

        // # Post a message
        cy.postMessage(messageText);

        cy.getLastPostId().then((postId) => {
            cy.clickPostReactionIcon(postId);

            // # Search for the emoji name text in emoji searching input
            cy.get('#emojiPickerSearch').should('be.visible').type(customEmoji);

            // * Get list of emojis based on the search text
            cy.findAllByTestId('emojiItem').children().should('have.length', 1);
            cy.findAllByTestId('emojiItem').children('img').first().should('have.class', 'emoji-category--custom');

            // # Select the custom emoji
            cy.findAllByTestId('emojiItem').children().click();
        });
    });

    it('MM-T2188 Custom emoji - delete emoji after using in post and reaction', () => {
        const {customEmoji, customEmojiWithColons} = getCustomEmoji();

        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.findByText('Custom Emoji').should('be.visible').click();

        // # Click on add new emoji
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile);

        // # Click on Save
        cy.get('.backstage-form__footer').findByText('Save').click().wait(TIMEOUTS.FIVE_SEC);

        // # Go back to home channel
        cy.findByText('Back to Mattermost').should('exist').and('be.visible').click().wait(TIMEOUTS.FIVE_SEC);

        // # Post a message with the emoji
        cy.postMessage(customEmojiWithColons);

        // * Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Click on custom emojis
        cy.findByText('Custom Emoji').should('be.visible').click();

        // # Select delete new emoji
        cy.findByRoleExtended('cell', {name: customEmojiWithColons}).scrollIntoView().should('be.visible').
            parent().findByText('Delete').click();

        // # Confirm deletion and back to main channel view
        cy.get('#confirmModalButton').should('be.visible').click();
        cy.findByText('Back to Mattermost').should('exist').and('be.visible').click().wait(TIMEOUTS.FIVE_SEC);

        cy.reload();

        // * Show emoji list
        cy.get('#emojiPickerButton').click();

        // # Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmojiWithColons);

        // * Get list of emojis based on search text
        cy.get('.no-results__title').should('be.visible').and('have.text', 'No results for "' + customEmoji + '"');

        // # Navigate to a channel
        cy.visit(townsquareLink);

        // * Verify that only the message renders in the post and the emoji has been deleted
        cy.getLastPost().find('p').should('have.html', '<span data-emoticon="' + customEmoji + '">' + customEmojiWithColons + '</span>');
    });
});
