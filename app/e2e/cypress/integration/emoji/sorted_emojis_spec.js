// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @emoji

describe('MM-T157 Filtered emojis are sorted by recency, then begins with, then contains (alphabetically within each)', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('By recency', () => {
        // #Post a dog emoji
        cy.postMessage(':dog:');

        // #Post a cat emoji
        cy.postMessage(':cat:');

        // #Open emoji picker
        cy.get('#emojiPickerButton').click();

        // #Assert first recently used emoji has the data-test-id value of 'cat' which was the last one we sent
        cy.findAllByTestId('emojiItem').first().within(($el) => {
            cy.wrap($el).findByTestId('cat').should('be.visible');
        });
    });

    it('By recently used emoji first in alphabetical order, Followed by emoji that contain "word" in alphabetical', () => {
        const emojiList = [];

        // #Post a guardsman emoji
        cy.postMessage(':guardsman:');

        // #Post a white small square emoji
        cy.postMessage(':white_small_square:');

        // #Open emoji picker
        cy.get('#emojiPickerButton').click();

        //#Search sma text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type('sma');

        // #Get list of recent emojis based on search text
        cy.findAllByTestId('emojiItem').children('img').each(($el) => {
            const emojiName = $el.get(0);
            emojiList.push(emojiName.dataset.testid);
        }).then(() => {
            // #Comparing list of emojis obtained from search above and making sure order is same as requirement describes
            expect(emojiList).to.deep.equal(['guardsman', 'white_small_square', 'small_airplane', 'small_blue_diamond', 'small_orange_diamond', 'small_red_triangle', 'small_red_triangle_down', 'arrow_down_small', 'arrow_up_small', 'black_medium_small_square', 'black_small_square', 'sun_behind_small_cloud', 'white_medium_small_square']);
        });
    });
});
