// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod

import {beRead, beUnread} from '../../support/assertions';
import * as TIMEOUTS from '../../fixtures/timeouts';

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

            cy.apiCreateGroupChannel(userIds).then(({channel}) => {
                groupChannel = channel;
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
        cy.get('#editChannelHeaderModalLabel').should('be.visible').wait(TIMEOUTS.ONE_SEC);
        cy.get('textarea#edit_textbox').should('be.visible').type(`${header}{enter}`);
        cy.get('#editChannelHeaderModalLabel').should('not.be.visible'); // wait for modal to disappear

        // * text appears in the top center panel
        cy.contains('#channelHeaderDescription span.header-description__text p', header);

        checkSystemMessage('updated the channel header');

        // * channel is marked as read for the current user
        cy.get(`#sidebarItem_${groupChannel.name}`).should(beRead);

        // * channel is marked as unread for other user
        cy.apiLogout();
        cy.apiLogin(userList[0]);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get(`#sidebarItem_${groupChannel.name}`).should(beUnread);
        cy.apiLogout();
    });

    it('MM-T473_1 Edit GM channel header (1/2)', () => {
        // # open existing GM
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/${groupChannel.name}`);

        // * verify header is set
        cy.contains('#channelHeaderDescription button span', 'Add a channel description').should('not.be.visible');

        const header = 'this is a new header!';
        editHeader(header);

        // * text appears at the top
        cy.contains('#channelHeaderDescription span.header-description__text p', header);

        checkSystemMessage('updated the channel header');

        // * channel is marked as unread for other users
        cy.apiLogout();
        cy.apiLogin(userList[0]);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get(`#sidebarItem_${groupChannel.name}`).should(beUnread);
        cy.apiLogout();
    });

    it('MM-T473_2 Edit GM channel header (2/2)', () => {
        // # open existing GM
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/${groupChannel.name}`);

        // * verify header is set
        cy.contains('#channelHeaderDescription button span', 'Add a channel description').should('not.be.visible');

        const header = `Header by @${testUser.username}`;
        editHeader(header);

        cy.contains('#channelHeaderDescription span a.mention-link', `@${testUser.username}`).should('exist');
        cy.contains('#channelHeaderDescription span.mention--highlight a.mention-link', `@${testUser.username}`).should('not.exist');
    });

    const editHeader = (header) => {
        // # Click edit channel header
        cy.get('#channelHeaderDropdownButton button').click();
        cy.get('#channelEditHeader button').click();

        // # type new header
        cy.get('#editChannelHeaderModalLabel').should('be.visible');
        cy.get('textarea#edit_textbox').should('be.visible').clear().type(`${header}{enter}`);
        cy.get('#editChannelHeaderModalLabel').should('not.exist'); // wait for modal to disappear
    };

    const checkSystemMessage = (message) => {
        // * system message is posted notifying of the change
        cy.getLastPostId().then((id) => {
            cy.get(`#postMessageText_${id}`).should('contain', message);
            cy.clickPostDotMenu(id).then(() => {
                // * system message can be deleted
                cy.get(`#delete_post_${id}`);
            });
        });
    };
});
