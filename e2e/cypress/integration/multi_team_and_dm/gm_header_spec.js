// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {beRead, beUnread} from '../../support/assertions';

describe('Multi-user group header', () => {
    let testUser;
    let testTeam;
    const userIds = [];
    const userList = [];
    let groupChannel;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            // # create a GM with at least 3 users
            ['charlie', 'diana', 'eddie'].forEach((name) => {
                cy.apiCreateUser({prefix: name, bypassTutorial: true}).then(({user: groupUser}) => {
                    cy.apiAddUserToTeam(testTeam.id, groupUser.id);
                    userIds.push(groupUser.id);
                    userList.push(groupUser);
                });
            });

            // # add test user to the list of group members
            userIds.push(testUser.id);

            cy.apiCreateGroupChannel(userIds).then((response) => {
                groupChannel = response.body;
            });
        });
    });

    it('MM-T472 Add a channel header to a GM', () => {
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/${groupChannel.name}`);

        // * no channel description is set
        cy.contains('#channelHeaderDescription button span', 'Add a channel description').should('be.visible');

        // # click add a channel description
        cy.get('#channelHeaderDescription button').click();

        // # type a header
        const header = 'this is a header!';
        cy.get('#editChannelHeaderModalLabel').should('be.visible');
        cy.get('textarea#edit_textbox').should('be.visible').type(`${header}{enter}`);

        // * text appears in the top center panel
        cy.contains('#channelHeaderDescription span.header-description__text p', header);

        // * there is a system message notifying of the change
        cy.getLastPostId().then((id) => {
            // * The system message should contain 'added to the channel by you'
            cy.get(`#postMessageText_${id}`).should('contain', 'updated the channel header');
        });

        // * channel is marked as read for the current user
        cy.get(`#sidebarItem_${groupChannel.name}`).should(beRead);

        // * channel is marked as unread for other user
        cy.apiLogout();
        cy.apiLogin(userList[0]);

        cy.get(`#sidebarItem_${groupChannel.name}`).should(beUnread);
    });
    it('MM-T473 Edit GM channel header', () => {
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/${groupChannel.name}`);

        // # open existing GM
        // * verify header is set
        // # Click edit channel header
        // # type new header
        // * text appears at the top
        // * system message is posted notifying of the change
        // * channel is marked as unread for other users
    });
});
