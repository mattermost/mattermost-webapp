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
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.visit('/ad-1/channels/town-square');
    });

    it('should go to town square channel view', () => {
        // # Go to town square channel
        cy.visit('/ad-1/channels/town-square');

        // * Check if the channel is loaded correctly
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
    });

    it('should go to private channel view', () => {
        cy.getCurrentTeamId().then((teamId) => {
            // # Create a private channel
            cy.apiCreateChannel(teamId, 'private-channel', 'Private channel', 'P').then((response) => {
                // # Go to the newly created channel
                cy.visit(`/ad-1/channels/${response.body.name}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Private channel');

                // # Remove the created channel
                cy.apiDeleteChannel(response.body.id);
            });
        });
    });

    it('should go to self direct channel using the multiple ways to go', () => {
        cy.apiGetUsers(['user-1']).then((userResponse) => {
            const user = userResponse.body[0];

            // # Create a self direct channel
            cy.apiCreateDirectChannel([user.id, user.id]).then((response) => {
                // # Visit the channel using the channel name
                cy.visit(`/ad-1/channels/${user.id}__${user.id}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'user-1');

                // # Visit the channel using the channel id
                cy.visit(`/ad-1/channels/${response.body.id}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'user-1');

                // # Visit the channel using the username
                cy.visit(`/ad-1/messages/@${user.username}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'user-1');

                // # Visit the channel using the user email
                cy.visit(`/ad-1/messages/${user.email}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'user-1');
            });
        });
    });

    it('should go to other user direct channel using multiple ways to go', () => {
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const user1 = userResponse.body[1];
            const user2 = userResponse.body[0];
            const userIds = [user2.id, user1.id];

            // # Create a direct channel between two users
            cy.apiCreateDirectChannel(userIds).then((response) => {
                // # Visit the channel using the channel name
                cy.visit(`/ad-1/channels/${user1.id}__${user2.id}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'sysadmin');

                // # Visit the channel using the channel id
                cy.visit(`/ad-1/channels/${response.body.id}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'sysadmin');

                // # Visit the channel using the target username
                cy.visit(`/ad-1/messages/@${user2.username}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'sysadmin');

                // # Visit the channel using the target user email
                cy.visit(`/ad-1/messages/${user2.email}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'sysadmin');
            });
        });
    });
    it('should go group channel using group id', () => {
        const users = ['user-1', 'aaron.peterson', 'sysadmin'];
        cy.apiGetUsers(users).then((userResponse) => {
            const userGroupIds = [userResponse.body[2].id, userResponse.body[1].id, userResponse.body[0].id];

            // # Create a group channel for 3 users
            cy.apiCreateGroupChannel(userGroupIds).then((response) => {
                // # Visit the channel using the name using the channels route
                cy.visit(`/ad-1/channels/${response.body.name}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'aaron.peterson, sysadmin');

                // # Visit the channel using the name using the messages route
                cy.visit(`/ad-1/messages/${response.body.name}`);

                // * Check you can go to the channel without problem
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'aaron.peterson, sysadmin');
            });
        });
    });
});
