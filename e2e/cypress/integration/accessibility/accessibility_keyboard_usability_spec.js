// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @accessibility

import users from '../../fixtures/users.json';

const otherUser = users['user-2'];
const count = 5;
let message;

function postMessages(cnt = 1) {
    cy.getCurrentChannelId().then((channelId) => {
        cy.apiGetUserByEmail(otherUser.email).then((emailResponse) => {
            cy.apiAddUserToChannel(channelId, emailResponse.body.id);
            for (let index = 0; index < cnt; index++) {
                // # Post Message as Current user
                message = `hello from sysadmin: ${Date.now()}`;
                cy.postMessage(message);
                message = `hello from ${otherUser.username}: ${Date.now()}`;
                cy.postMessageAs({sender: otherUser, message, channelId});
            }
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
        });
    });
}

describe('Verify Accessibility keyboard usability across different regions in the app', () => {
    before(() => {
        cy.apiLogin('sysadmin');

        // Visit the Town Square channel
        cy.visit('/ad-1/channels/town-square');

        // # Post few messages
        postMessages(count);
    });

    it('MM-24051 Verify Keyboard support in Search Results', () => {
        // # Search for a term
        cy.get('#searchBox').type('hello').type('{enter}', {force: true});

        // # Change the focus to search results
        cy.get('#searchContainer').within(() => {
            cy.get('button.sidebar--right__expand').focus().tab({shift: true}).tab();
            cy.focused().tab().tab();
        });
        cy.get('body').type('{downarrow}{uparrow}');

        // # Use down arrow keys and verify if results are highlighted sequentially
        for (let index = 0; index < count; index++) {
            cy.get('#search-items-container').children('.search-item__container').eq(index).then(($el) => {
                // * Verify search result is highlighted
                cy.get($el).find('.post').should('have.class', 'a11y--active a11y--focused');
                cy.get('body').type('{downarrow}');
            });
        }

        // # Use up arrow keys and verify if results are highlighted sequentially
        for (let index = count; index > 0; index--) {
            cy.get('#search-items-container').children('.search-item__container').eq(index).then(($el) => {
                // * Verify search result is highlighted
                cy.get($el).find('.post').should('have.class', 'a11y--active a11y--focused');
                cy.get('body').type('{uparrow}');
            });
        }
    });

    it('MM-24051 Verify Keyboard support in RHS', () => {
        // # Post Message as Current user
        message = `hello from sysadmin: ${Date.now()}`;
        cy.postMessage(message);

        // # Post few replies on RHS
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            cy.get('#rhsContainer').should('be.visible');
            cy.getCurrentChannelId().then((channelId) => {
                for (let index = 0; index < count; index++) {
                    const replyMessage = `A reply ${Date.now()}`;
                    cy.postMessageReplyInRHS(replyMessage);
                    message = `reply from ${otherUser.username}: ${Date.now()}`;
                    cy.postMessageAs({sender: otherUser, message, channelId, rootId: postId});
                }
            });
        });

        // * Verify that the highlight order is in the reverse direction in RHS
        cy.get('#rhsContent').should('have.attr', 'data-a11y-order-reversed', 'true').and('have.attr', 'data-a11y-focus-child', 'true');

        // # Change the focus to the last post
        cy.get('#rhsContainer').within(() => {
            cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true});
        });
        cy.get('body').type('{uparrow}{downarrow}');

        // # Use up arrow keys and verify if results are highlighted sequentially
        const total = count * 2; // # total number of expected posts in RHS
        let row = total - 1; // # the row index which should be focused

        for (let index = count; index > 0; index--) {
            cy.get('#rhsPostList').children('.post').eq(row).then(($el) => {
                // * Verify search result is highlighted
                cy.get($el).should('have.class', 'a11y--active a11y--focused');
                cy.get('body').type('{uparrow}');
            });
            row--;
        }

        // # Use down arrow keys and verify if posts are highlighted sequentially
        for (let index = count; index > 0; index--) {
            cy.get('#rhsPostList').children('.post').eq(row).then(($el) => {
                // * Verify search result is highlighted
                cy.get($el).should('have.class', 'a11y--active a11y--focused');
                cy.get('body').type('{downarrow}');
            });
            row++;
        }
    });

    it('MM-24051 Verify Screen reader should not switch to virtual cursor mode', () => {
        // # Open RHS
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);

            // * Verify Screen reader should not switch to virtual cursor mode. This is handled by adding a role=application attribute
            const regions = ['#lhsHeader', '#lhsList', '#rhsContent', '.search__form', '#centerChannelFooter'];
            regions.forEach((region) => {
                cy.get(region).should('have.attr', 'role', 'application');
            });
            cy.get(`#post_${postId}`).children('.post__content').eq(0).should('have.attr', 'role', 'application');
            cy.get(`#rhsPost_${postId}`).children('.post__content').eq(0).should('have.attr', 'role', 'application');
        });
    });
});
