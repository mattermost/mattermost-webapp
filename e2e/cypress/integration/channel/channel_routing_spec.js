// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Channel routing', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('should go to town square channel view', () => {
        cy.visit('/ad-1/channels/town-square');
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
    });

    it('should go to private channel view', () => {
        cy.getCurrentTeamId().then((teamId) => {
            cy.apiCreateChannel(teamId, 'private-channel', 'Private channel', 'P').then((response) => {
                cy.visit(`/ad-1/channels/${response.body.name}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Private channel');
                cy.apiDeleteChannel(response.body.id);
            });
        });
    });

    it('should go to self direct channel using the multiple ways to go', () => {
        cy.apiGetUsers(['user-1']).then((userResponse) => {
            const user = userResponse.body[0];
            cy.apiCreateDirectChannel([user.id, user.id]).then((response) => {
                cy.visit(`/ad-1/channels/${user.id}__${user.id}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'user-1');
                cy.visit(`/ad-1/channels/${response.body.id}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'user-1');
                cy.visit(`/ad-1/messages/@${user.username}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'user-1');
                cy.visit(`/ad-1/messages/${user.email}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'user-1');
            });
        });
    });

    it('should go to other user direct channel using multiple ways to go', () => {
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const user1 = userResponse.body[1];
            const user2 = userResponse.body[0];
            const userIds = [user2.id, user1.id];
            cy.apiCreateDirectChannel(userIds).then((response) => {
                cy.visit(`/ad-1/channels/${user1.id}__${user2.id}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'sysadmin');
                cy.visit(`/ad-1/channels/${response.body.id}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'sysadmin');
                cy.visit(`/ad-1/messages/@${user2.username}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'sysadmin');
                cy.visit(`/ad-1/messages/${user2.email}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'sysadmin');
            });
        });
    });
    it('should go group channel using group id', () => {
        const users = ['user-1', 'aaron.peterson', 'sysadmin'];
        cy.apiGetUsers(users).then((userResponse) => {
            const userGroupIds = [userResponse.body[2].id, userResponse.body[1].id, userResponse.body[0].id];
            cy.apiCreateGroupChannel(userGroupIds).then((response) => {
                cy.visit(`/ad-1/channels/${response.body.name}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'aaron.peterson, sysadmin');
                cy.visit(`/ad-1/messages/${response.body.name}`);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'aaron.peterson, sysadmin');
            });
        });
    });
});