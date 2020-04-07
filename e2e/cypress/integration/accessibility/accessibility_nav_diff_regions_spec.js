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
let message;

function postMessages(count = 1) {
    cy.getCurrentChannelId().then((channelId) => {
        cy.apiGetUserByEmail(otherUser.email).then((emailResponse) => {
            cy.apiAddUserToChannel(channelId, emailResponse.body.id);
            for (let index = 0; index < count; index++) {
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

function verifyNavSupport(element, label, tabOrder) {
    cy.get(element).
        should('have.attr', 'aria-label', label).
        and('have.attr', 'data-a11y-sort-order', tabOrder).
        and('have.class', 'a11y__region a11y--active');
}

describe('Verify Quick Navigation support across different regions in the app', () => {
    before(() => {
        cy.apiLogin('sysadmin');

        // Visit the Town Square channel
        cy.visit('/ad-1/channels/town-square');

        // # Post few messages
        postMessages(2);
    });

    it('MM-22626 Verify Navigation Support in Post List & Post Input', () => {
        // # Shift focus to the last post
        cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true});
        cy.get('body').type('{uparrow}{downarrow}');

        // * Verify post region reads out correctly
        verifyNavSupport('#virtualizedPostListContent > div', 'message list main region', '1');

        // # Shift focus to the post input
        cy.get('#fileUploadButton').focus().tab({shift: true});

        // * Verify post input region reads out correctly
        verifyNavSupport('#centerChannelFooter', 'message input complimentary region', '2');
    });

    it('MM-22626 Verify Navigation Support in RHS Post List & RHS Post Input', () => {
        // # Open RHS and reply
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            const replyMessage = 'A reply to an older post';
            cy.postMessageReplyInRHS(replyMessage);
        });

        // * Verify post message in RHS
        cy.get('#rhsContainer').within(() => {
            // # Shift the focus to the last post
            cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true}).type('{uparrow}');

            // * Verify post region on RHS reads out correctly
            verifyNavSupport('#rhsContent', 'message details complimentary region', '3');

            // # Shift the focus to the RHS input
            cy.get('#fileUploadButton').focus().tab({shift: true});

            // * Verify post input on RHS reads out correctly
            verifyNavSupport('#rhsFooter', 'reply input region', '4');
        });
    });

    it('MM-22626 Verify Navigation Support in LHS Sidebar', () => {
        // # Change the focus to Main Menu button
        cy.get('#headerInfo button').focus().tab({shift: true}).tab();

        // * Verify nav support in LHS sidebar header
        verifyNavSupport('#lhsHeader', 'team menu region', '5');

        // # Change the focus to the LHS sidebar
        cy.get('#headerInfo button').focus().tab({shift: true}).tab().tab();

        // * Verify nav support in LHS sidebar
        verifyNavSupport('#lhsList', 'channel sidebar region', '6');
    });

    it('MM-22626 Verify Navigation Support in Channel Header', () => {
        // # Change the focus to Main Menu button
        cy.get('#toggleFavorite').focus().tab({shift: true}).tab();

        // * Verify nav support in LHS sidebar header
        verifyNavSupport('#channel-header', 'channel header region', '8');
    });

    it('MM-22626 Verify Navigation Support in Search Results', () => {
        // # Search for some text
        cy.get('#searchBox').should('be.visible').type('hello {enter}');

        // # Change the focus to search results
        cy.get('#searchContainer').within(() => {
            cy.get('button.sidebar--right__expand').focus().tab({shift: true}).tab();
            cy.focused().tab().tab();
        });
        cy.get('body').type('{downarrow}{uparrow}');

        // * Verify nav support in Search Results Container
        verifyNavSupport('#search-items-container', 'Search Results complimentary region', '3');
    });
});
