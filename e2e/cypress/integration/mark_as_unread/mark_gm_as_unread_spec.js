// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @mark_as_unread

import {markAsUnreadByPostIdFromMenu, verifyPostNextToNewMessageSeparator} from './helpers';

describe('Mark as Unread', () => {
    let testUser;
    let otherUser1;
    let otherUser2;

    before(() => {
        // # create testUser added to channel
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            // # create second user and add to the team
            cy.apiCreateUser({prefix: 'otherA'}).then(({user: newUser}) => {
                otherUser1 = newUser;

                cy.apiAddUserToTeam(team.id, newUser.id);
            });

            // # create third user and add to the team
            cy.apiCreateUser({prefix: 'otherB'}).then(({user: newUser}) => {
                otherUser2 = newUser;

                cy.apiAddUserToTeam(team.id, newUser.id);
            });

            // # Login as test user and go to town square
            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('should go group channel using group id', () => {
        const userGroupIds = [testUser.id, otherUser1.id, otherUser2.id];

        // # Create a group channel for 3 users
        cy.apiCreateGroupChannel(userGroupIds).then((response) => {
            const gmChannel = response.body;

            // # Visit the channel using the name using the channels route
            for (let index = 0; index < 8; index++) {
                // # Post Message as otherUser1
                cy.postMessageAs({sender: otherUser1, message: `this is from user: ${otherUser1.id}, ${index}`, channelId: gmChannel.id});

                // # Post Message as otherUser2
                cy.postMessageAs({sender: otherUser2, message: `this is from user: ${otherUser2.id}, ${index}`, channelId: gmChannel.id});
            }

            // # go to the group message channel
            cy.get(`#sidebarItem_${gmChannel.name}`).click();

            // # mark the post to be unread
            cy.getNthPostId(-2).then((postId) => {
                markAsUnreadByPostIdFromMenu(postId);
            });

            // * verify the notification seperator line exists and present before the unread message
            verifyPostNextToNewMessageSeparator(`this is from user: ${otherUser1.id}, 7`);

            // * verify the group message in LHS is unread
            cy.get(`#sidebarItem_${gmChannel.name}`).should('have.class', 'unread-title');

            // # leave the group message channel
            cy.get('#sidebarItem_town-square').click();

            // * verify the group message in LHS is unread
            cy.get(`#sidebarItem_${gmChannel.name}`).should('have.class', 'unread-title');

            // # go to the group message channel
            cy.get(`#sidebarItem_${gmChannel.name}`).click();

            // * verify the group message in LHS is read
            cy.get(`#sidebarItem_${gmChannel.name}`).should('exist').should('not.have.class', 'unread-title');

            // * verify the notification seperator line exists and present before the unread message
            verifyPostNextToNewMessageSeparator(`this is from user: ${otherUser1.id}, 7`);
        });
    });
});
