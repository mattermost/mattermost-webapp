// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @accessibility

let previousEmoji = 'grinning';

function verifyArrowKeysEmojiNavigation(arrowKey, count) {
    for (let index = 0; index < count; index++) {
        cy.get('body').type(arrowKey);
        // eslint-disable-next-line no-loop-func
        cy.get('.emoji-picker__preview-name').invoke('text').then((selectedEmoji) => {
            expect(selectedEmoji).not.equal(previousEmoji);
            previousEmoji = selectedEmoji;
        });
    }
}

describe('Verify Accessibility Support in Popovers', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/off-topic`);

            // # Post a message
            cy.postMessage(`hello from test user: ${Date.now()}`);
        });
    });

    it('MM-T1489 Accessibility Support in Emoji Popover on click of Emoji Reaction button', () => {
        cy.getLastPostId().then((postId) => {
            // # Open the Emoji Popover
            cy.clickPostReactionIcon(postId);

            // * Verify accessibility support in Emoji Search input
            cy.get('#emojiPickerSearch').should('have.attr', 'aria-label', 'Search for an emoji');

            // # Focus on the first emoji Category
            cy.get('#emojiPickerCategories').children().eq(0).focus().tab({shift: true}).tab();

            // * Verify if emoji Categories gets the focus when tab is pressed
            cy.get('#emojiPickerCategories').children('.emoji-picker__category').each(($el, index) => {
                // * Verify for first 3 categories
                if (index < 3) {
                    // * Verify accessibility support in emoji category
                    cy.get($el).should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('not.be.empty');

                    // * Verify if corresponding section is displayed when emoji category has focus and clicked
                    cy.get($el).children('i').invoke('attr', 'title').then((title) => {
                        cy.get($el).trigger('click');

                        // * Verify if corresponding section is displayed
                        cy.findByText(title).should('be.visible');
                    });

                    // * Verify emoji navigation using arrow keys
                    verifyArrowKeysEmojiNavigation('{rightarrow}', 3);
                    verifyArrowKeysEmojiNavigation('{leftarrow}', 2);

                    // # Press tab
                    cy.get($el).focus().tab();
                }
            });

            // # Close the Emoji Popover
            cy.get('body').click();
        });
    });
});
