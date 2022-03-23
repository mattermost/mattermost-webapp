// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @collapsed_reply_threads

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
                    cy.postMessageAs({sender: otherUser, message: 'Root post: Delete test', channelId: testChannel.id}).then((post) => {
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

    it('MM-T4445 thread is removed when root post is deleted (current behavior is incorrect, see comments below)', () => {
        /**
         * When you delete a post the current behavior in displaying it and the thread replies is incorrect.
         * Deleting a root post leads to a post showing `(message deleted)`, but still rendering the replies
         * in the ThreadFooter. Ideally we should remove the root post without removing the replies.
         */
        cy.uiWaitUntilMessagePostedIncludes(rootPost.data.message);

        // # Thread footer should not exist
        cy.uiGetPostThreadFooter(rootPost.id).should('not.exist');

        // # Post a reply post as current user
        cy.postMessageAs({sender: testUser, message: 'reply!', channelId: testChannel.id, rootId: rootPost.id});

        // # Visit global threads
        cy.uiClickSidebarItem('threads');

        // * There should be a single thread item
        cy.get('article.ThreadItem').should('have.lengthOf', 1);

        // # Delete thread root post
        cy.apiDeletePost(rootPost.id);

        // * There should be a single thread item showing '(message deleted)'
        cy.get('article.ThreadItem').should('have.lengthOf', 1).should('contain.text', '(message deleted)');

        // # refresh the page
        cy.reload();

        // * There should be no thread item anymore
        cy.get('article.ThreadItem').should('have.lengthOf', 0);
    });
});
