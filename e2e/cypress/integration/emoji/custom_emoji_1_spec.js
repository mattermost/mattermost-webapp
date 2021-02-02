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

    const animatedGifEmojiFile = 'animated-gif-image-file.gif';

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

    it('MM-T3668 User cant add custom emoji with the same name as a system one', () => {
        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.findByText('Custom Emoji').should('be.visible').click();

        // # Click on add new emoji
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name and click on save
        cy.get('#name').type('croissant');
        cy.get('.backstage-form__footer').within(($form) => {
            cy.findByText('Save').click();

            // * Check for error saying that the emoji icon is a system one
            cy.wrap($form).find('.has-error').should('be.visible').and('have.text', 'This name is already in use by a system emoji. Please choose another name.');
        });
    });

    it('MM-T2180 Custom emoji - cancel out of add', () => {
        const {customEmoji} = getCustomEmoji();

        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.findByText('Custom Emoji').should('be.visible').click();

        // # Click on add new emoji
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name
        cy.get('#name').type(customEmoji);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile('mattermost-icon.png');

        // # Click on Cancel
        cy.get('.backstage-form__footer').findByText('Cancel').click().wait(TIMEOUTS.FIVE_SEC);

        // # Go back to home channel
        cy.findByText('Back to Mattermost').should('exist').and('be.visible').click().wait(TIMEOUTS.FIVE_SEC);

        // # Open emoji picker
        cy.get('#emojiPickerButton').should('exist').and('be.visible').click();

        // # Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmoji);

        // * Validate that we cannot find the emoji name in the search result list
        cy.get('.no-results__title').should('be.visible').and('have.text', 'No results for "' + customEmoji + '"');
    });

    it('MM-T2181 Custom emoji - add large', () => {
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

        // # Open emoji picker
        cy.get('#emojiPickerButton').should('exist').and('be.visible').click();

        // # Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmojiWithColons);

        // * Get list of emojis based on search text
        cy.findAllByTestId('emojiItem').children().should('have.length', 1);
        cy.findAllByTestId('emojiItem').children('img').first().should('have.class', 'emoji-category--custom');

        // # Post a message with the emoji
        cy.get('#post_textbox').clear().type(customEmojiWithColons.substring(0, 10));

        // * Suggestion list should appear
        cy.get('#suggestionList').should('be.visible');

        // * Emoji name should appear in the list
        cy.findByText(customEmojiWithColons).should('be.visible');

        // # Hit enter to select from suggestion list and enter to post
        cy.get('#post_textbox').type('{enter}').type('{enter}');

        // * Check that the emoji image appears in the message - extract the image url and compare with local image
        verifyLastPostedEmoji(customEmojiWithColons, largeEmojiFileResized);

        // # Reload the page
        cy.reload();

        // * Check that the emoji image appears in the message - extract the image url and compare with local image
        verifyLastPostedEmoji(customEmojiWithColons, largeEmojiFileResized);
    });

    it('MM-T2182 Custom emoji - animated gif', () => {
        const {customEmojiWithColons} = getCustomEmoji();

        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.findByText('Custom Emoji').should('be.visible').click();

        // # Click on add new emoji
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name
        cy.get('#name').should('be.visible').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(animatedGifEmojiFile);

        // # Click on Save
        cy.get('.backstage-form__footer').findByText('Save').click().wait(TIMEOUTS.FIVE_SEC);

        // # Go back to home channel
        cy.findByText('Back to Mattermost').should('exist').and('be.visible').click().wait(TIMEOUTS.FIVE_SEC);

        // # Post a message with the emoji
        cy.postMessage(customEmojiWithColons);

        // # Open emoji picker
        cy.get('#emojiPickerButton').should('exist').and('be.visible').click();

        // # Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmojiWithColons);

        // * Get list of emojis based on search text
        cy.findAllByTestId('emojiItem').children().should('have.length', 1);
        cy.findAllByTestId('emojiItem').children('img').first().should('have.class', 'emoji-category--custom');
    });
});
