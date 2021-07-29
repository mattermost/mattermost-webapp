// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

describe('Read/Unread Threads', () => {
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

    it('should show a new messages line for an unread thread', () => {
        cy.postMessageAs({
            sender: testUser,
            message: 'Another interesting post,',
            channelId: testChannel.id,
        }).then(({id: rootId}) => {
            cy.postMessageAs({
                sender: otherUser,
                message: 'Self reply!',
                channelId: testChannel.id,
                rootId,
            });

            cy.get(`#post_${rootId}`).click();
            cy.get('#rhsContainer').findByTestId('NotificationSeparator').should('exist');

            cy.closeRHS();
        });
    });

    it('should not show a new messages line after viewing the thread', () => {
        cy.getLastPostId().then((rootId) => {
            cy.get(`#post_${rootId}`).click();
            cy.get('#rhsContainer').findByTestId('NotificationSeparator').should('not.exist');

            cy.closeRHS();
        });
    });
});
