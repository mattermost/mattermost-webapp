// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires the MatterPoll plugin installed (https://github.com/matterpoll/matterpoll).
 */

import * as MESSAGES from '../../fixtures/messages';

describe('/poll', () => {
    let user1;
    let user2;
    let testChannelUrl;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            user1 = user;
            testChannelUrl = `/${team.name}/channels/town-square`;

            cy.apiCreateUser().then(({user: otherUser}) => {
                user2 = otherUser;

                cy.apiAddUserToTeam(team.id, user2.id);
            });
        });
    });

    beforeEach(() => {
        cy.apiLogin(user1);
        cy.visit(testChannelUrl);
    });

    it('MM-T576 /poll (Steps #1)', () => {
        cy.postMessage(MESSAGES.SMALL);

        // # Click to reply on any message to open the RHS
        cy.clickPostCommentIcon();

        // # In center post the following: /poll "Do you like https://mattermost.com?"
        cy.postMessage('/poll "Do you like https://mattermost.com?"');

        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                // * Poll displays as expected in center
                cy.findByLabelText('matterpoll').should('be.visible');

                // * Mattermost URL renders as a live link
                cy.contains('a', 'https://mattermost.com').
                    should('have.attr', 'href', 'https://mattermost.com');

                // # Click "Yes" or "No"
                cy.findByText('Yes').click();
            });
        });

        // * After clicking Yes or No, ephemeral message displays "Your vote has been counted"
        cy.uiWaitUntilMessagePostedIncludes('Your vote has been counted.');

        // * If you go back and change your vote to another answer, ephemeral message displays "Your vote has been updated."
        cy.getNthPostId(-2).then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.findByText('No').click();
            });
        });
        cy.uiWaitUntilMessagePostedIncludes('Your vote has been updated');

        cy.get('#rhsContainer').within(() => {
            // # In RHS, post `/poll Reply`
            cy.get('#reply_textbox').type('/poll reply{enter}');

            // * Poll displays as expected in RHS.
            cy.findByLabelText('matterpoll').should('be.visible');
        });

        cy.apiLogin(user2);
        cy.visit(testChannelUrl);

        // # Another user clicks Yes or No
        cy.getNthPostId(-2).then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.findByText('No').click();
            });
        });

        cy.apiLogin(user1);
        cy.visit(testChannelUrl);
        cy.getNthPostId(-2).then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.findByText('End Poll').click();
            });
        });

        cy.findByText('End').click();

        // * Username displays the same on the original poll post and on the "This poll has ended" post
        cy.uiWaitUntilMessagePostedIncludes('The poll Do you like https://mattermost.com? has ended');
        cy.getNthPostId(-3).then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.contains('This poll has ended').should('be.visible');
                cy.findByText(user1.nickname).should('be.visible');
            });
        });
    });
});
