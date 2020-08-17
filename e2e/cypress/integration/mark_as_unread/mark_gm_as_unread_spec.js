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
    let testTeam;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;

            cy.apiCreateUser({prefix: 'otherA'}).then(({user: newUser}) => {
                otherUser1 = newUser;

                cy.apiAddUserToTeam(team.id, newUser.id);
            });

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
            cy.visit(`/${testTeam.name}/channels/${gmChannel.name}`);
            for (let index = 0; index < 3; index++) {
                // # Post Message as otherUser1
                cy.postMessageAs({sender: otherUser1, message: `this is from user: ${otherUser1.id}, ${index}`, channelId: gmChannel.id});

                // # Post Message as otherUser2
                cy.postMessageAs({sender: otherUser1, message: `this is from user: ${otherUser1.id}, ${index}`, channelId: gmChannel.id});
            }

            cy.getLastPostId().then((postId) => {
                // cy.get(`#postMessageText_${postId}`).as('postMessageText');
                markAsUnreadByPostIdFromMenu(postId);
            });

            verifyPostNextToNewMessageSeparator(`this is from user: ${otherUser1.id}, 2`);

            // markAsUnreadFromMenu(tMess);
        });
    });
});
