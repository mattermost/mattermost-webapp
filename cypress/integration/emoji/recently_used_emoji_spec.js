// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

import {getRandomInt} from '../../utils';

describe('MM-14014 Recently Emoji', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('M14014 Recently used emojis are shown 1st', async () => {
        // 2. Get random emoji index
        const emojiIndex = getRandomInt(400);

        // 3. Show emoji list
        cy.get('#emojiPickerButton').should('be.visible').click();

        // 4. Click emoji with random index
        cy.get('.emoji-picker__item').eq(emojiIndex).click();

        // 5. Submit post
        cy.get('#create_post').submit();

        // 6. Open emoji list
        cy.get('#emojiPickerButton').click();

        // 7. Wait 500 millisecond
        cy.wait(500); // eslint-disable-line

        // 8. Get second emoji
        const secondEmoji = getRandomInt(400);

        // 9. Click chosen emoji
        cy.get('.emoji-picker__item').eq(secondEmoji).click();

        // 10. Submit post
        cy.get('#create_post').submit();

        // 11. Open emoji list
        cy.get('#emojiPickerButton').click();

        // 12. Wait 500 millisecond
        cy.wait(500); // eslint-disable-line

        // * Assert recent emoji should equal with last post emoji
        cy.get('.emoji-picker__item').eq(secondEmoji).find('img').then(($el) => {
            cy.get('.emoji-picker__item').eq(0).find('img').should('have.attr', 'src', $el.attr('src'));
        });
    });
});
