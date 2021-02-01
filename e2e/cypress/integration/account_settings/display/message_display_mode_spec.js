// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import {getRandomId} from '../../../utils';

describe('Account Settings > Display > Message Display', () => {
    before(() => {
        // # Login as new user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    ['COMPACT', 'STANDARD'].forEach((display) => {
        it(`M14283 ${display} view: Line breaks remain intact after editing`, () => {
            cy.uiChangeMessageDisplaySetting(display);

            const firstLine = `First line ${getRandomId()}`;
            const secondLine = `Text after ${getRandomId()}`;

            // # Enter in text
            cy.get('#post_textbox').
                clear().
                type(firstLine).
                type('{shift}{enter}{enter}').
                type(`${secondLine}{enter}`);

            // # Get last postId
            cy.getLastPostId().then((postId) => {
                const postMessageTextId = `#postMessageText_${postId}`;

                // * Verify HTML still includes new line
                cy.get(postMessageTextId).should('have.html', `<p>${firstLine}</p>\n<p>${secondLine}</p>`);

                // # click dot menu button
                cy.clickPostDotMenu(postId);

                // # click edit post
                cy.get(`#edit_post_${postId}`).scrollIntoView().should('be.visible').click();

                // # Add ",edited" to the text
                cy.get('#edit_textbox').type(',edited');

                // # Save
                cy.get('#editButton').click();

                // * Verify HTML includes newline and the edit
                cy.get(postMessageTextId).should('have.html', `<p>${firstLine}</p>\n<p>${secondLine},edited</p>`);

                // * Post should have (edited)
                cy.get(`#postEdited_${postId}`).
                    should('be.visible').
                    should('contain', '(edited)');
            });
        });
    });
});
