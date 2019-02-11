// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

import assert from 'assert';

describe('Post Dropdown Menu', () => {
    before(() => {
        // 1. Go to Main Channel View with "user-1"
        cy.toMainChannelView('user-1');
    });

    it('should open dropdown menu on click of dotmenu icon', () => {
        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');

        // 3. Post a message
        const message = 'test for dropdown menu';
        cy.get('#post_textbox').type(message + '{enter}');

        // * Check post list content
        cy.get('#postListContent').each((postList) => {
            const divPost = postList[0].children[postList[0].children.length - 1];
            assert.ok(divPost, 'should get the posted message');

            const postId = divPost.id.replace('post_', '');

            // * Check that the message is posted
            cy.get(`#${postId}_message`).should('contain', message);

            // * Check that the center dotmenu button and menu are not visible
            cy.get(`#CENTER_button_${postId}`).should('not.be.visible');
            cy.get(`#CENTER_menu_${postId}`).should('not.be.visible');

            // 4. Click the center dotmenu button of the post
            cy.get(`#CENTER_button_${postId}`).click({force: true});

            // * Check that the center dotmenu button of the post becomes visible
            cy.get(`#CENTER_button_${postId}`).should('be.visible').should('have.attr', 'class', 'dropdown-toggle post__dropdown color--link style--none');

            // * Check that the center post menu becomes visible as well
            cy.get(`#CENTER_menu_${postId} > .dropdown-menu`).should('be.visible');

            // 5. Click again the center dotmenu button of the post
            cy.get(`#CENTER_button_${postId}`).click();

            // * Check that the center dotmenu button and menu are not visible
            cy.get(`#CENTER_button_${postId}`).should('not.be.visible');
            cy.get(`#CENTER_menu_${postId}`).should('not.be.visible');
        });
    });
});
