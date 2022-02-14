// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @emoji @timeout_error

import * as TIMEOUTS from '../../fixtures/timeouts';
import * as MESSAGES from '../../fixtures/messages';

import {getCustomEmoji} from './helpers';

describe('Recent Emoji', () => {
    const largeEmojiFile = 'gif-image-file.gif';

    let townsquareLink;

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
            cy.apiLogin(user);
            townsquareLink = `/${team.name}/channels/town-square`;
            cy.visit(townsquareLink);
        });
    });

    it('MM-T155 Recently used emoji reactions are shown first', () => {
        const firstEmoji = 5;
        const secondEmoji = 10;

        // # Show emoji list
        cy.uiOpenEmojiPicker();

        // # Click first emoji
        cy.get('#emojiPicker').should('be.visible');
        cy.get('.emoji-picker__item').eq(firstEmoji).click().wait(TIMEOUTS.HALF_SEC);

        // # Submit post
        const message = 'hi';
        cy.get('#post_textbox').should('be.visible').and('have.value', ':sweat_smile: ').type(`${message} {enter}`);
        cy.uiWaitUntilMessagePostedIncludes(message);

        // # Post reaction to post
        cy.clickPostReactionIcon();

        // # Click second emoji
        cy.get('.emoji-picker__item').eq(secondEmoji).click().wait(TIMEOUTS.HALF_SEC);

        // # Show emoji list
        cy.uiOpenEmojiPicker().wait(TIMEOUTS.HALF_SEC);

        // * Assert first emoji should equal with second recent emoji
        cy.get('.emoji-picker__item').eq(firstEmoji + 2).find('img').then((first) => {
            cy.get('.emoji-picker__item').eq(1).find('img').should('have.attr', 'class', first.attr('class'));

            // * Assert second emoji should equal with first recent emoji
            cy.get('.emoji-picker__item').eq(secondEmoji + 1).find('img').then((second) => {
                cy.get('.emoji-picker__item').eq(0).find('img').should('have.attr', 'class', second.attr('class'));
            });
        });
    });

    it('MM-T4463 Recently used custom emoji, when is deleted should be removed from recent emoji category and quick reactions', () => {
        const {customEmoji, customEmojiWithColons} = getCustomEmoji();

        // # Open custom emoji
        cy.uiOpenCustomEmoji();

        // # Click on add new emoji button on custom emoji page
        cy.findByText('Add Custom Emoji').should('be.visible').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile).wait(TIMEOUTS.THREE_SEC);

        // # Click on Save
        cy.uiSave().wait(TIMEOUTS.THREE_SEC);

        // # Go back to home channel
        cy.visit(townsquareLink);

        // # Post a system emoji
        cy.postMessage(`${MESSAGES.TINY}-second :lemon:`);

        // # Post a custom emoji
        // We let autocomplete emoji to be shown as this is a custom emoji, properties are loaded then we press enter twice, first one to auto complete add, next for post enter
        cy.get('#post_textbox').clear().type(`${MESSAGES.TINY}-recent ${customEmojiWithColons.slice(0, -1)}`).wait(TIMEOUTS.TWO_SEC);
        cy.get('#post_textbox').type('{enter} {enter}').wait(TIMEOUTS.TWO_SEC);

        // # Hover over the last post by opening dot menu on it
        cy.clickPostDotMenu();

        cy.get('#recent_reaction_0').should('exist').then((recentReaction) => {
            // * Assert that custom emoji is present as most recent in quick reaction menu
            expect(recentReaction[0].style.backgroundImage).to.include('api/v4/emoji');
        });

        cy.get('#recent_reaction_1').should('exist').then((recentReaction) => {
            // * Assert that system emoji is present as second recent in quick reaction menu
            expect(recentReaction[0].style.backgroundImage).to.include('static/emoji/');
        });

        // # Open emoji picker
        cy.uiOpenEmojiPicker();

        // * Verify recently used category is present in emoji picker
        cy.findByText('Recently Used').should('exist').and('be.visible');

        // * Verify most recent one is the custom emoji in emoji picker
        cy.findAllByTestId('emojiItem').eq(0).find('img').should('have.attr', 'class', 'emoji-category--custom');

        // * Verify second most recent one is the system emoji in emoji picker
        cy.findAllByTestId('emojiItem').eq(1).find('img').should('have.attr', 'aria-label', 'lemon emoji');

        // # Go to custom emoji page
        cy.findByText('Custom Emoji').should('be.visible').click();

        // # Search for the custom emoji
        cy.findByPlaceholderText('Search Custom Emoji').should('be.visible').type(customEmoji).wait(TIMEOUTS.HALF_SEC);

        cy.get('.emoji-list__table').should('be.visible').within(() => {
            // * Since we are searching exactly for that custom emoji, we should get only one result
            cy.findAllByText(customEmojiWithColons).should('have.length', 1);

            // # Delete the custom emoji
            cy.findAllByText('Delete').should('have.length', 1).click();
        });

        // # Confirm deletion
        cy.get('#confirmModalButton').should('be.visible').click();

        // # Go back to home channel
        cy.visit(townsquareLink);

        cy.reload();

        // # Hover over the last post by opening dot menu on it
        cy.clickPostDotMenu();

        cy.get('#recent_reaction_0').should('exist').then((recentReaction) => {
            // * Assert that instead of custom emoji the system emoji is present as most recent in quick reaction menu
            expect(recentReaction[0].style.backgroundImage).to.include('static/emoji/');
        });

        // # Open emoji picker again
        cy.uiOpenEmojiPicker();

        // * Verify recently used category is present in emoji picker
        cy.findByText('Recently Used').should('exist').and('be.visible');

        // * Verify most recent one is the system emoji in emoji picker and not the custom emoji
        cy.findAllByTestId('emojiItem').eq(0).find('img').should('have.attr', 'aria-label', 'lemon emoji');
    });
});
