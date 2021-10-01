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

describe('Account Settings', () => {
    before(() => {
        // # Login as new user and visit off-topic
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T103_1 Compact view: Line breaks remain intact after editing', () => {
        // * Verify line breaks do not change and blank line is still there in compact view.
        verifyLineBreaksRemainIntact('COMPACT');
    });

    it('MM-T103_2 Standard view: Line breaks remain intact after editing', () => {
        // * Verify line breaks do not change and blank line is still there in standard view.
        verifyLineBreaksRemainIntact('STANDARD');
    });
});

function verifyLineBreaksRemainIntact(display) {
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
        cy.get(postMessageTextId).should('contain.html', `<p>${firstLine}</p>\n<p>${secondLine},edited <span`);

        // * Post should have (edited)
        cy.get(`#postEdited_${postId}`).
            should('be.visible').
            should('contain', 'Edited');
    });
}
