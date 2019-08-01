// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. 1. Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Message', () => {
    const testSelectedIndex = (done) => {
        cy.get('.emoji-picker__item.selected').then((selectedEmoji) => {
            done(selectedEmoji.index());
        });
    };

    beforeEach(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Open emoji picker
        cy.get('#emojiPickerButton').click();

        // # Wait for emojis to load
        cy.get('#emojiPicker').should('be.visible');

        // # Select "People" category
        cy.get('#emojiPickerCategories').find('.fa.fa-smile-o').click();
    });

    describe('starting with no prior selection', () => {
        ['right', 'down'].forEach((dir) => {
            it(`${dir} key press should select the first emoji`, () => {
                // # Type directional arrow key
                cy.get('#emojiPickerSearch').type(`{${dir}arrow}`);

                // * The the first emoji in the "People" category should be selected
                testSelectedIndex((idx) => expect(idx).to.equal(0));
            });
        });

        ['left', 'up'].forEach((dir) => {
            it(`${dir} key press should select nothing`, () => {
                // # Type directional arrow key
                cy.get('#emojiPickerSearch').type(`{${dir}arrow}`);

                // * There should be no selection
                cy.get('.emoji-picker__item.selected').should('not.exist');
            });
        });
    });

    describe('starting with first emoji selected', () => {
        beforeEach(() => {
            // # Type right arrow key
            cy.get('#emojiPickerSearch').type('{rightarrow}');
        });

        it('right key press should select the second emoji in the list', () => {
            // # Type directional arrow key
            cy.get('#emojiPickerSearch').type('{rightarrow}');

            // * Second emoji should now be selected
            testSelectedIndex((idx) => expect(idx).to.equal(1));
        });

        it('down key press should select emoji >= 6 elements away in list', () => {
            // # Type directional arrow key
            cy.get('#emojiPickerSearch').type('{downarrow}');

            // * Down arrow should select next row, index distance is dependant on browser size
            testSelectedIndex((idx) => expect(idx).to.greaterThan(5));
        });

        ['left', 'up'].forEach((dir) => {
            it(`selection should remain at index 0 on ${dir} key press`, () => {
                // # Type directional arrow key
                cy.get('#emojiPickerSearch').type(`{${dir}arrow}`);

                // * Index should still equal 0
                testSelectedIndex((idx) => expect(idx).to.equal(0));
            });
        });

        it('proper emoji should post', () => {
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

    it('M16738 Use keyboard navigation in emoji picker', () => {
        // # Move around and verify emojis with directional arrow input
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
                // # Press a directional key
                cy.get('#emojiPickerSearch').type(`{${direction}arrow}`);

                // * id of selected emoji should be different from last iteration
                cy.get('.emoji-picker__item.selected img').invoke('attr', 'id').then(checkSelectionId);

                // * Verify that the selected picker item matches the sprite preview
                cy.get('.emoji-picker__item.selected img').invoke('attr', 'src').then(checkSelectionSrc);
            }
        }
    });
});
