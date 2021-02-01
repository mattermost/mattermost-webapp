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

    const tooLargeEmojiFile = 'huge-image.jpg';

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

    it('MM-T2183 Custom emoji - try to add too large', () => {
        const {customEmojiWithColons} = getCustomEmoji();

        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.findByText('Custom Emoji').should('be.visible').click();

        // # Click on add new emoji
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(tooLargeEmojiFile);

        // * Is the image loaded?
        cy.get('.add-emoji__filename').should('have.text', tooLargeEmojiFile);
        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Save
            cy.findByText('Save').click().wait(TIMEOUTS.FIVE_SEC);

            // * Check for error
            cy.wrap($form).find('.has-error').should('be.visible').and('have.text', 'Unable to create emoji. Image must be smaller than 1028 by 1028.');
        });
    });

    it('MM-T2184 Custom emoji - filter list', () => {
        const {customEmojiWithColons} = getCustomEmoji();

        const emojiNameForSearch1 = 'alabala';
        const emojiNameForSearch2 = customEmojiWithColons;

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

        // # Click emoji picker button
        cy.get('#emojiPickerButton').should('be.visible').click();

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
