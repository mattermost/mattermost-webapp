// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
//
//  Group: @collapsed_reply_threads

describe('Collapsed Reply Threads', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let testChannel;
    let rootPost;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ThreadAutoFollow: true,
                CollapsedThreads: 'default_off',
            },
        });

        // # Create new channel and other user, and add other user to channel
        cy.apiInitSetup({loginAfter: true, promoteNewUserAsAdmin: true}).then(({team, channel, user}) => {
            testTeam = team;
            testUser = user;
            testChannel = channel;

            cy.apiSaveCRTPreference(testUser.id, 'on');
            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);

                    // # Post a message as other user
                    cy.postMessageAs({sender: otherUser, message: 'Root post', channelId: testChannel.id}).then((post) => {
                        rootPost = post;
                    });
                });
            });
        });
    });

    beforeEach(() => {
        // # Visit the channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
    });

    it('MM-T4142 should show number of replies in thread', () => {
        // # Thread footer should not exist
        cy.get(`#post_${rootPost.id}`).find('.ThreadFooter').should('not.exist');

        // # Post a reply post as current user
        cy.postMessageAs({sender: testUser, message: 'reply!', channelId: testChannel.id, rootId: rootPost.id});

        // # Get last root post
        cy.get(`#post_${rootPost.id}`).

            // * Get Thread footer
            get('.ThreadFooter').
            within(() => {
                // * Reply button in Thread Footer should say '1 reply'
                cy.get('.ReplyButton').should('have.text', '1 reply');

                // * 2 avatars/participants should show in Thread Footer
                cy.get('.Avatar').should('have.lengthOf', 2);
            });

        // # Visit global threads
        cy.uiVisitSidebarItem('threads');

        // * The sole thread item should have text in footer saying '1 reply'
        cy.get('article.ThreadItem').find('.activity').should('have.text', '1 reply');

        // # Visit the channel
        cy.uiVisitSidebarItem(testChannel.name);

        // # Post another reply as current user
        cy.postMessageAs({sender: testUser, message: 'another reply!', channelId: testChannel.id, rootId: rootPost.id});

        // # Get last root post
        cy.get(`#post_${rootPost.id}`).

            // # Get Thread footer
            get('.ThreadFooter').
            within(() => {
                // * Reply button in thread footer should say '2 replies'
                cy.get('.ReplyButton').should('have.text', '2 replies');

                // * 2 avatars/participants should show in Thread Footer
                cy.get('.Avatar').should('have.lengthOf', 2);
            });

        // # Visit global threads
        cy.uiVisitSidebarItem('threads');

        // * The sole thread item should have text in footer saying '2 replies'
        cy.get('article.ThreadItem').find('.activity').should('have.text', '2 replies');
    });

    it('MM-T4143 Emoji reaction - type +:+1:', () => {
        // # Create a root post
        cy.postMessage('Hello!');

        cy.getLastPostId().then((postId) => {
            // # Click on post to open the thread in RHS
            cy.get(`#post_${postId}`).click();

            // # Type "+:+1:" in comment box to react to the post with a thumbs-up and post
            cy.postMessageReplyInRHS('+:+1:');

            // * Thumbs-up reaction displays as reaction on post
            cy.get(`#${postId}_message`).within(() => {
                cy.findByLabelText('reactions').should('be.visible');
                cy.findByLabelText('remove reaction +1').should('be.visible');
            });

            // * Reacting to a root post should not create a thread (thread footer should not exist)
            cy.get(`#post_${postId}`).within(() => {
                cy.get('.ThreadFooter').should('not.exist');
            });

            // # Close RHS
            cy.closeRHS();
        });
    });
});
