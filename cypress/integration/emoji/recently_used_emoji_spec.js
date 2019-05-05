// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

describe('Recent Emoji', () => {
    before(() => {
        // 1. Login and go to /
        cy.apiLogin();
        cy.visit('/');
    });

    it('M14014 Recently used emojis are shown 1st', async () => {
        // 2 before test delete all recent emoji on local storage
        cy.clearLocalStorage(/recent_emojis/);

        // 3. Get random emoji index
        const firstEmoji = 200;

        // 4. Show emoji list
        cy.get('#emojiPickerButton').should('be.visible').click();

        // 5. Click emoji with random index
        cy.get('.emoji-picker__item').eq(firstEmoji).click();

        // 6. Submit post
        cy.get('#create_post').submit();

        // 7. Wait 500 millisecond
        cy.wait(500); // eslint-disable-line

        // 8. Post reaction to post
        cy.clickPostReactionIcon();

        // 9. Get second emoji
        const secondEmoji = 100;

        // 10. Click chosen emoji
        cy.get('.emoji-picker__item').eq(secondEmoji).click();

        // 11. Show emoji list
        cy.get('#emojiPickerButton').click();

        // * Assert first emoji should equal with second recent emoji
        cy.get('.emoji-picker__item').eq(firstEmoji + 2).find('img').then(($el) => {
            cy.get('.emoji-picker__item').eq(1).find('img').should('have.attr', 'class', $el.attr('class'));
        });

        // * Assert second emoji should equal with first recent emoji
        cy.get('.emoji-picker__item').eq(secondEmoji + 1).find('img').then(($el) => {
            cy.get('.emoji-picker__item').eq(0).find('img').should('have.attr', 'class', $el.attr('class'));
        });
    });
});
