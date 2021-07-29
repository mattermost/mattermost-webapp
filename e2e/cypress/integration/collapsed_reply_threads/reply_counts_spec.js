// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

describe('Reply counts', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let testChannel;
    let rootPost;

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

                    cy.postMessageAs({sender: otherUser, message: 'Root post', channelId: testChannel.id}).then((post) => {
                        rootPost = post;
                    });
                });
            });
        });
    });

    beforeEach(() => {
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
    });

    it('should show number of replies in thread', () => {
        cy.get(`#post_${rootPost.id}`).find('.ThreadFooter').should('not.exist');

        cy.postMessageAs({sender: testUser, message: 'reply!', channelId: testChannel.id, rootId: rootPost.id});

        cy.get(`#post_${rootPost.id}`).
            get('.ThreadFooter').should('exist').
            within(() => {
                cy.get('.ReplyButton').should('have.text', '1 reply');
                cy.get('.Avatar').should('have.lengthOf', 2);
            });

        cy.visit(`/${testTeam.name}/threads`);

        cy.get('article.ThreadItem').find('.activity').should('have.text', '1 reply');

        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.postMessageAs({sender: testUser, message: 'another reply!', channelId: testChannel.id, rootId: rootPost.id});

        cy.get(`#post_${rootPost.id}`).
            get('.ThreadFooter').should('exist').
            within(() => {
                cy.get('.ReplyButton').should('have.text', '2 replies');
                cy.get('.Avatar').should('have.lengthOf', 2);
            });

        cy.visit(`/${testTeam.name}/threads`);

        cy.get('article.ThreadItem').find('.activity').should('have.text', '2 replies');
    });
});
