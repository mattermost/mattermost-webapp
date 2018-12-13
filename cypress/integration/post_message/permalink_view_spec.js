// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

describe('Permalink View', () => {
    before(() => {
        // 1. Go to Main Channel View with "user-1"
        cy.toMainChannelView('user-1');
    });

    it('should render permalink view on click of timestamp', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post a message as "first message"
        cy.get('#post_textbox').type('first message{enter}');

        // 4. Post another message as "second message"
        cy.get('#post_textbox').type('second message{enter}');

        let lastPostId;

        // * Check post list content
        cy.get('#postListContent').each((postList) => {
            const lastDivPost = postList[0].children[postList[0].children.length - 1];
            if (lastDivPost && !lastPostId) {
                lastPostId = lastDivPost.id.replace('post_', '');

                // * Check that the last message posted is "second message"
                cy.get(`#${lastPostId}_message`).should('contain', 'second message');

                // * Check initial state that the last message posted is not highlighted
                cy.get(`#${lastDivPost.id}`).should('be.visible').should('have.attr', 'class', 'post same--user same--root  current--user');

                // * Check initial state that "the jump to recent messages" is not visible
                cy.get('#archive-link-home').should('not.be.visible');

                // * Check that the permalink ID for that last message is not visible
                cy.get(`#permalink_${lastPostId}`).should('not.be.visible');

                // 5. Click the permalink ID of that last post
                cy.get(`#permalink_${lastPostId}`).click({force: true});

                // * Check that the permalink ID for that last message is still not visible after clicking
                cy.get(`#permalink_${lastPostId}`).should('not.be.visible');

                // * Check that it redirected to the permalink
                cy.url().should('include', `/ad-1/pl/${lastPostId}`);

                // * Check that the post is highlighted on permalink view
                cy.get(`#${lastDivPost.id}`).should('be.visible').should('have.attr', 'class', 'post post--highlight same--user same--root  current--user');

                cy.get('#archive-link-home').
                    should('be.visible').
                    should('contain', 'Click here to jump to recent messages.');
            }
        });
    });
});
