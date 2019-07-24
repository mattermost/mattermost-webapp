// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Filtered emojis are sorted by recency, then begins with, then contains', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
        cy.clearLocalStorage(/recent_emojis/);
    });

    it('should order emoji by recency', async () => {
        // #Post a dog emoji
        cy.postMessage(':dog:');

        // #Post a cat emoji
        cy.postMessage(':cat:');

        // #Open emoji picker
        cy.get('#emojiPickerButton').click();

        // #Assert first recently used emoji has the data-test-id value of 'cat' which was the last one we sent
        cy.get("[data-testid='emoji__item']").first().children.should('have.data-testid', 'cat');
    });

    it.only('should order recently used emoji first in alphabetical order, Followed by emoji that contain "word" in alphabetical', async () => {
        const emojiList = [];

        // #Post a guardsman emoji
        cy.postMessage(':guardsman:');

        // #Post a white small square emoji
        cy.postMessage(':white_small_square:');

        // #Open emoji picker
        cy.get('#emojiPickerButton').click();

        // #Search sma text in emoji searching input
        cy.get("[data-test-id='emoji-input__search']").type('sma').then(() => {
            // #Get list of recent emojis based on search text
            cy.get("[data-testid='emoji__item']").children('img').each(($el) => {
                const emojiName = $el.get(0);
                emojiList.push(emojiName.dataset.testid);
            }).then(() => {
                // #Comparing list of emojis obtained from search above and making sure order is same as requirement describes
                expect(emojiList).to.deep.equal(['guardsman', 'white_small_square', 'small_airplane', 'small_blue_diamond', 'small_orange_diamond', 'small_red_triangle', 'small_red_triangle_down', 'arrow_down_small', 'arrow_up_small', 'black_medium_small_square', 'black_small_square', 'sun_behind_small_cloud', 'white_medium_small_square'])
            });
        });
    });
});
