// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

import assert from 'assert';

describe('Permalink View', () => {
    before(() => {
        // 1. Go to Main Channel View with "user-1"
        cy.toMainChannelView('user-1');
    });

    it('should render permalink view on click of post timestamp at center view', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post consecutive messages
        const firstMessage = 'first message for permalink';
        cy.get('#post_textbox').type(firstMessage + '{enter}');
        cy.get('#post_textbox').type('second message for permalink{enter}');

        // * Check post list content
        cy.get('#postListContent').each((postList) => {
            const firstDivPost = postList[0].children[postList[0].children.length - 2];
            assert.ok(firstDivPost, 'should get the first posted message');

            const firstPostId = firstDivPost.id.replace('post_', '');

            // * Check that the first message is posted
            cy.get(`#${firstPostId}_message`).should('contain', firstMessage);

            // * Check initial state that the first message posted is not highlighted
            cy.get(`#${firstDivPost.id}`).should('be.visible').should('have.attr', 'class', 'post same--user same--root  current--user');

            // * Check initial state that "the jump to recent messages" is not visible
            cy.get('#archive-link-home').should('not.be.visible');

            // * Check that the timestamp of the first post is not visible
            cy.get(`#CENTER_time_${firstPostId}`).should('not.be.visible');

            // 4. Click the timestamp of the first post
            cy.get(`#CENTER_time_${firstPostId}`).click({force: true});

            // * Check that it redirected to permalink view
            cy.url().should('include', `/ad-1/pl/${firstPostId}`);

            // * Check that the post is highlighted on permalink view
            cy.get(`#${firstDivPost.id}`).should('be.visible').should('have.attr', 'class', 'post post--highlight same--user same--root  current--user');

            cy.get('#archive-link-home').
                should('be.visible').
                should('contain', 'Click here to jump to recent messages.');
        });
    });
});
