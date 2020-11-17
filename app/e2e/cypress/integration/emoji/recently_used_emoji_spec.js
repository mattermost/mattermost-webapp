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

describe('Recent Emoji', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
            cy.get('#channelHeaderTitle').should('be.visible').and('contain', 'Town Square');
            cy.postMessage('hello');
        });
    });

    it('MM-T155 Recently used emoji reactions are shown first', () => {
        // # Before test delete all recent emoji on local storage
        cy.clearLocalStorage(/recent_emojis/);

        const firstEmoji = 5;
        const secondEmoji = 10;

        // # Show emoji list
        cy.get('#emojiPickerButton').should('be.visible').click();

        // # Click first emoji
        cy.get('#emojiPicker').should('be.visible');
        cy.get('.emoji-picker__item').eq(firstEmoji).click().wait(TIMEOUTS.HALF_SEC);

        // # Submit post
        cy.get('#create_post').submit().wait(TIMEOUTS.HALF_SEC);

        // # Post reaction to post
        cy.clickPostReactionIcon();

        // # Click second emoji
        cy.get('.emoji-picker__item').eq(secondEmoji).click().wait(TIMEOUTS.HALF_SEC);

        // # Show emoji list
        cy.get('#emojiPickerButton').click().wait(TIMEOUTS.HALF_SEC);

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
