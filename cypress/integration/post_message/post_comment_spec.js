// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

import assert from 'assert';

describe('Post Comment', () => {
    before(() => {
        // 1. Go to Main Channel View with "user-1"
        cy.toMainChannelView('user-1');
    });

    it('should open and close RHS on click of comment icon', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post a message
        const message = 'test for opening and closing RHS';
        cy.get('#post_textbox').type(message + '{enter}');
        cy.get('#post_textbox').type('post another message{enter}');

        // * Check post list content
        cy.get('#postListContent').each((postList) => {
            const firstDivPost = postList[0].children[postList[0].children.length - 2];
            assert.ok(firstDivPost, 'should get the posted message');

            const firstPostId = firstDivPost.id.replace('post_', '');

            // * Check that the message is posted
            cy.get(`#${firstPostId}_message`).should('contain', message);

            // * Check that the center post comment icon is not visible and RHS is closed
            cy.get(`#commentIcon_${firstPostId}`).should('not.be.visible');
            cy.get('#rhsContainer').should('not.be.visible');

            // 4. Click the center post comment icon of the post
            cy.get(`#commentIcon_${firstPostId}`).click({force: true});

            // * Check that the RHS is open
            cy.get('#rhsContainer').should('be.visible');

            // 5. Click close button of RHS
            cy.get('#rhsCloseButton').should('be.visible').click();

            // * Check that the center post comment icon is not visible and RHS is closed
            cy.get(`#commentIcon_${firstPostId}`).should('not.be.visible');
            cy.get('#rhsContainer').should('not.be.visible');
        });
    });
});
