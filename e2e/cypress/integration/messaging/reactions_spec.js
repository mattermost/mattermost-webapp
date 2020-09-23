// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    let testTeam;
    let testChannel;
    let testUser;

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testUser = user;
            testTeam = team;
            testChannel = channel;
            cy.apiLogin(testUser);
        });
    });

    beforeEach(() => {
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
    });

    it('MM-T2189 Emoji reaction - type +:+1:', () => {
        // # Post a message
        cy.postMessage('Hello');

        cy.getLastPostId().then((postId) => {
            // # Click reply to open the post in the right hand side
            cy.clickPostCommentIcon(postId);

            // # Type "+:+1:" in comment box to react to the post with a thumbs-up and post
            cy.postMessageReplyInRHS('+:+1:{enter}');

            // * Thumbs-up reaction displays as reaction on post
            cy.get(`#${postId}_message`).within(() => {
                cy.findByLabelText('reactions').should('exist');
                cy.findByLabelText('remove reaction +1').should('exist');
            });
        });
    });
});
