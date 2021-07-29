// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

describe('Follow/Unfollow Threads', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let testChannel;

    before(() => {
        cy.apiInitSetup({loginAfter: true, promoteNewUserAsAdmin: true}).then(({team, channel, user}) => {
            testTeam = team;
            testUser = user;
            testChannel = channel;

            cy.apiSaveCRTPreference(testUser.id, 'on');
            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });
        });
    });

    beforeEach(() => {
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
    });

    it('should follow a thread after replying', () => {
        cy.postMessageAs({
            sender: otherUser,
            message: 'Root post,',
            channelId: testChannel.id,
        }).then(({id: rootId}) => {
            cy.get(`#post_${rootId}`).find('.ThreadFooter').should('not.exist');

            cy.get(`#post_${rootId}`).click();

            cy.get(`#post_${rootId}`).get('.ThreadFooter').should('not.exist');

            cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Follow');

            cy.postMessageReplyInRHS('Reply!');

            cy.get(`#post_${rootId}`).
                get('.ThreadFooter').should('exist').
                within(() => {
                    cy.get('.FollowButton').should('have.text', 'Following');
                });

            cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Following');

            cy.visit(`/${testTeam.name}/threads`);

            cy.get('article.ThreadItem').should('have.have.lengthOf', 1);
        });
    });

    it('should follow a thread after marking it as unread', () => {
        cy.postMessageAs({
            sender: otherUser,
            message: 'Another interesting post,',
            channelId: testChannel.id,
        }).then(({id: rootId}) => {
            cy.postMessageAs({
                sender: otherUser,
                message: 'Self reply!',
                channelId: testChannel.id,
                rootId,
            }).then(({id: replyId}) => {
                cy.get(`#post_${rootId}`).within(() => {
                    cy.get('.ThreadFooter').should('exist').
                        find('.FollowButton').should('have.text', 'Follow');
                });

                cy.get(`#post_${rootId}`).click();

                cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Follow');

                cy.uiClickPostDropdownMenu(replyId, 'Mark as Unread', 'RHS_COMMENT');

                cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Following');

                cy.get(`#post_${rootId}`).within(() => {
                    cy.get('.ThreadFooter').should('exist').
                        find('.FollowButton').should('have.text', 'Following');
                });

                cy.visit(`/${testTeam.name}/threads`);
                cy.get('article.ThreadItem').should('have.have.lengthOf', 2);
            });
        });
    });

    it('clicking "Following" button in the footer should unfollow the thread', () => {
        cy.getLastPostId().then((rootId) => {
            cy.get(`#post_${rootId}`).click();

            cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Following');

            cy.get(`#post_${rootId}`).within(() => {
                cy.get('.ThreadFooter').should('exist');
                cy.get('.FollowButton').should('have.text', 'Following');
                cy.get('.FollowButton').click();
                cy.get('.FollowButton').should('have.text', 'Follow');
            });

            cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Follow');
            cy.closeRHS();
        });
    });

    it('clicking "Follow" button in the footer should follow the thread', () => {
        cy.getLastPostId().then((rootId) => {
            cy.get(`#post_${rootId}`).click();

            cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Follow');

            cy.get(`#post_${rootId}`).within(() => {
                cy.get('.ThreadFooter').should('exist');
                cy.get('.FollowButton').should('have.text', 'Follow');
                cy.get('.FollowButton').click();
                cy.get('.FollowButton').should('have.text', 'Following');
            });

            cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Following');
            cy.closeRHS();
        });
    });
});
