// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***********************************************************  ****

// Group: @notifications

import {getRandomId} from '../../utils';

describe('Notifications', () => {
    let testTeam;
    let firstUser;
    let secondUser;

    before(() => {
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            // # Create two users with same first name in username
            cy.apiCreateUser({user: generateTestUser()}).then(
                ({user: user1}) => {
                    firstUser = user1;
                    cy.apiAddUserToTeam(testTeam.id, firstUser.id);
                },
            );

            cy.apiCreateUser({user: generateTestUser()}).then(
                ({user: user2}) => {
                    secondUser = user2;
                    cy.apiAddUserToTeam(testTeam.id, secondUser.id);
                },
            );
        });
    });

    it('MM-T486 Users with the same firstname in their username should not get a mention when one of them leaves a channel', () => {
        // # Login as first user
        cy.apiLogin(firstUser);

        cy.apiCreateChannel(testTeam.id, 'test_channel', 'Test Channel').then((response) => {
            const testChannel = response.body;

            // # Visit the newly created channel as the first user and invite the second user
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
            cy.apiAddUserToChannel(testChannel.id, secondUser.id);

            // # Go to the 'Off Topic' channel and logout
            cy.get('#sidebarItem_off-topic').should('be.visible').click();
            cy.apiLogout();

            // # Login as the second user and go to the team site
            cy.apiLogin(secondUser);
            cy.visit(`/${testTeam.name}`);

            // * Verify that the channel that the first created is visible and that there is one unread mention (for being invited)
            cy.get(`#sidebarItem_${testChannel.name}`).should('be.visible').within(() => {
                cy.findByText(testChannel.display_name).should('be.visible');
                cy.get('#unreadMentions').should('have.text', '1');
            });

            // # Go to the test channel
            cy.get(`#sidebarItem_${testChannel.name}`).click();

            // # Verify that the mention does not exist anymore
            checkUnreadMentions(testChannel);

            // # Leave the test channel and logout
            cy.get('#channelHeaderDropdownButton').should('be.visible').click();
            cy.get('#channelLeaveChannel').should('be.visible').click();
            cy.apiLogout();

            // # Login as first user
            cy.apiLogin(firstUser);

            // * Verify that the first user did not get a mention from the test channel when the second user left
            checkUnreadMentions(testChannel);
        });
    });

    // Function to check that the unread mentions badge does not exist (the user was not mentioned in the test channel)
    function checkUnreadMentions(testChannel) {
        cy.get(`#sidebarItem_${testChannel.name}`).within(() => {
            cy.get('#unreadMentions').should('not.exist');
        });
    }

    // Function to generate a test user with username - `saturnino.${randomId}`
    function generateTestUser(prefix = 'user') {
        const randomId = getRandomId();

        return {
            email: `${prefix}${randomId}@sample.mattermost.com`,
            username: `saturnino.${randomId}`,
            password: 'passwd',
            first_name: `First${randomId}`,
            last_name: `Last${randomId}`,
            nickname: `Nickname${randomId}`,
        };
    }
});
