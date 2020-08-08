// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    let testTeam;
    let testChannel;
    let receiver;
    let sender;
    let lastPostId;

    before(() => {
        // # Login as test user
        cy.apiInitSetup().then(({team, channel, user}) => {
            receiver = user;
            testTeam = team;
            testChannel = channel;

            cy.apiCreateUser().then(({user: user1}) => {
                sender = user1;
                cy.apiAddUserToTeam(testTeam.id, sender.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, sender.id);
                });
            });

            cy.apiLogin(receiver);

            // # Visit a test channel and post a message
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
            cy.postMessage('Hello');

            // # Assign lastPostId variable to the id of the last post
            cy.getLastPostId().then((postId) => {
                lastPostId = postId;
            });
        });
    });

    it('M23346 - Pinned parent post: reply count remains in center channel and is correct', () => {
        // # Login as the other user
        cy.apiLogin(sender);

        // # Wait for three seconds (sometimes the element won't render if we don't wait)
        cy.wait(TIMEOUTS.THREE_SEC);

        // # Click the reply button, and post a reply four times and close the thread rhs tab
        cy.get(`#post_${lastPostId}`).trigger('mouseover');
        cy.get(`#CENTER_commentIcon_${lastPostId}`).click({force: true});
        for (let i = 0; i < 5; i++) {
            cy.get('#reply_textbox').type(`Hello to you too ${i}`);
            cy.get('#addCommentButton').click();
        }
        cy.get('#rhsCloseButton').click();

        // # Wait for three seconds (sometimes the element won't render if we don't wait)
        cy.wait(TIMEOUTS.THREE_SEC);

        // # Pin the post to the channel
        cy.get(`#post_${lastPostId}`).trigger('mouseover');
        cy.get(`#CENTER_button_${lastPostId}`).click({force: true});
        cy.get(`#pin_post_${lastPostId}`).click({force: true});

        // * Assert that the reply count exists and is correct
        cy.get(`#CENTER_commentIcon_${lastPostId}`).find('span').eq(0).find('span').eq(1).should('have.text', '5');
    });
});
