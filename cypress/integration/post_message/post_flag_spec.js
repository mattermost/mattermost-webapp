// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

import assert from 'assert';

describe('Flag Post', () => {
    before(() => {
        // 1. Go to Main Channel View with "user-1"
        cy.toMainChannelView('user-1');
    });

    it('should flag a post on click to flag icon at center view', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post a message
        cy.get('#post_textbox').type('first message for flagged post{enter}');
        const secondMessage = 'second message for flagged post';
        cy.get('#post_textbox').type(secondMessage + '{enter}');
        cy.get('#post_textbox').type('third message for flagged post{enter}');

        // * Check post list content
        cy.get('#postListContent').each((postList) => {
            const secondDivPost = postList[0].children[postList[0].children.length - 2];
            assert.ok(secondDivPost, 'should get the second posted message');

            const secondPostId = secondDivPost.id.replace('post_', '');

            // * Check that the second message is posted
            cy.get(`#${secondPostId}_message`).should('contain', secondMessage);

            // * Check that the center flag icon of the second post is not visible
            cy.get(`#centerPostFlag_${secondPostId}`).should('not.be.visible');

            // 4. Click the center flag icon of the second post
            cy.get(`#centerPostFlag_${secondPostId}`).click({force: true});

            // * Check that the center flag icon of the second post becomes visible
            cy.get(`#centerPostFlag_${secondPostId}`).should('be.visible').should('have.attr', 'class', 'style--none flag-icon__container visible');

            // 5. Click again the center flag icon of the second post
            cy.get(`#centerPostFlag_${secondPostId}`).click();

            // * Check that the center flag icon of the second post is now hidden.
            cy.get(`#centerPostFlag_${secondPostId}`).should('not.be.visible');
        });
    });
});
