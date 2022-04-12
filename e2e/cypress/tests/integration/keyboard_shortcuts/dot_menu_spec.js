// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @keyboard_shortcuts
import {beUnread} from '../../support/assertions';
import {stubClipboard} from '../../utils';

describe('Keyboard Shortcuts', () => {
    let testTeam;
    let testChannel;
    const postMessage = 'test for saved post';
    const postEditMessage = ' POST EDITED';
    before(() => {
        // # Login as test user and visit off-topic channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;
            cy.visit(`/${team.name}/channels/off-topic`);
        });
        cy.postMessage(postMessage);
    });

    it('MM-42585 Dot Menu Shorcuts', () => {
        cy.getLastPostId().then((postId) => {
            stubClipboard().as('clipboard');
            const permalink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${postId}`;

            // # Reply
            cy.uiPostDropdownMenuShortcut(postId, 'Reply', 'R');

            // * Verify reply text box is focused
            cy.get('#reply_textbox').should('be.focused');

            // # Mark as unread
            cy.uiPostDropdownMenuShortcut(postId, 'Mark as Unread', 'U');

            // * Verify the channel is unread in LHS
            cy.get(`#sidebarItem_${testChannel.name}`).should(beUnread);

            // # Pin Post
            cy.uiPostDropdownMenuShortcut(postId, 'Pin to Channel', 'P');

            // * Verify post is pinned
            cy.get(`#post_${postId}`).find('.post-pre-header').should('be.visible').and('have.text', 'Pinned');

            // # Unpin Post
            cy.uiPostDropdownMenuShortcut(postId, 'Unpin from Channel', 'P');

            // * Verify post is unpinned
            cy.get(`#post_${postId}`).and('not.have.text', 'Pinned');

            // # Copy Link
            cy.uiPostDropdownMenuShortcut(postId, 'Copy Link', 'K');

            // * Verify link is copied to the clipboard
            cy.get('@clipboard').its('contents').should('eq', permalink);

            // # Edit
            cy.uiPostDropdownMenuShortcut(postId, 'Edit', 'E');

            // # add test to the message
            cy.get('body').type(postEditMessage);
            cy.get('body').type('{enter}');

            // * Verify edited message
            cy.uiWaitUntilMessagePostedIncludes(postMessage + postEditMessage);
            cy.get(`#postMessageText_${postId}`).
                and('have.text', postMessage + postEditMessage + ' Edited');

            // # Copy Text
            cy.uiPostDropdownMenuShortcut(postId, 'Copy Text', 'C');

            // * Verify message is copied to the clipboard
            cy.get('@clipboard').its('contents').should('eq', postMessage + postEditMessage);
        });

        cy.postMessage('message to delete');
        cy.getLastPostId().then((postId) => {
            // # Delete
            cy.uiPostDropdownMenuShortcut(postId, 'Delete', '{del}');
            cy.findByText('Delete').click();

            // * Verify message was deleted
            cy.findByText('message to delete').should('not.exist');
        });
    });
});
