// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('M16738 - Use keyboard navigation in emoji picker', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    beforeEach(() => {
        // # Open emoji picker
        cy.get('#emojiPickerButton').click();

        // # Wait for emoji picker to load
        cy.get('#emojiPicker').should('be.visible');
    });

    ['right', 'down'].forEach((dir) => {
        it(`${dir} keypress should select the first emoji on start without prior selection`, () => {
            // # Type arrow key
            cy.get('#emojiPickerSearch').type(`{${dir}arrow}`);

            // * The first emoji in the "People" category should be selected
            testSelectedIndex((idx) => expect(idx).to.equal(0));

            // # Close emoji picker
            cy.get('#emojiPickerButton').click();
        });
    });

    ['left', 'up'].forEach((dir) => {
        it(`${dir} keypress should select nothing on start without prior selection`, () => {
            // # Type arrow key
            cy.get('#emojiPickerSearch').type(`{${dir}arrow}`);

            // * There should be no selection
            cy.get('.emoji-picker__item.selected').should('not.exist');

            // # Close emoji picker
            cy.get('#emojiPickerButton').click();
        });
    });

    it('should select emoji on continuous keypress', () => {
        // # Move around with arrow key and verify selected emojis
        let lastSelected = null;
        const pressCounts = {
            right: 5,
            down: 5,
            left: 4,
            up: 5,
        };

        const checkSelectionId = (selectedEmoji) => {
            expect(selectedEmoji).to.not.equal(lastSelected);
            lastSelected = selectedEmoji;
        };
        const checkSelectionSrc = (selectedEmoji) => {
            cy.get('#emojiPickerSpritePreview').invoke('attr', 'src').should('equal', selectedEmoji);
        };

        for (const direction of Object.keys(pressCounts)) {
            for (let i = 0; i < pressCounts[direction]; i += 1) {
                // # Press arrow key
                cy.get('#emojiPickerSearch').type(`{${direction}arrow}`);

                // * id of selected emoji should be different from last iteration
                cy.get('.emoji-picker__item.selected img').invoke('attr', 'id').then(checkSelectionId);

                // * Verify that the selected emoji matches the sprite preview
                cy.get('.emoji-picker__item.selected img').invoke('attr', 'src').then(checkSelectionSrc);
            }
        }

        // # Close emoji picker
        cy.get('#emojiPickerButton').click();
    });

    it('should post selected emoji', () => {
        // # Press arrow keys
        cy.get('#emojiPickerSearch').type('{rightarrow}{downarrow}');

        cy.get('#emojiPickerAliasesPreview').invoke('text').then((selectedEmoji) => {
            // # Select chosen emoji
            cy.get('#emojiPickerSearch').type('{enter}');

            // # Post message with keyboard
            cy.get('#post_textbox').type('{enter}');

            // * Compare selected emoji with last post
            cy.getLastPost().find('.emoticon').should('have.attr', 'title', selectedEmoji);
        });
    });
});

const testSelectedIndex = (done) => {
    cy.get('.emoji-picker__item.selected').then((selectedEmoji) => {
        done(selectedEmoji.index());
    });
};
