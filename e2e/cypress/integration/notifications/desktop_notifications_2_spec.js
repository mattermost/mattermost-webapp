// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @notifications

import {spyNotificationAs} from '../../support/notification';

import {changeDesktopNotificationAs} from './helper';

describe('Desktop notifications', () => {
    let testTeam;
    let testUser;
    let otherUser;

    before(() => {
        // Initialise a user
        cy.apiInitSetup().then(({team, user: user1}) => {
            otherUser = user1;
            testTeam = team;

            cy.apiCreateUser().then(({user: user2}) => {
                testUser = user2;
                cy.apiAddUserToTeam(testTeam.id, testUser.id);
                cy.apiLogin(testUser);

                // Visit town-square.
                cy.visit(`/${testTeam.name}/channels/town-square`);
            });
        });
    });

    it('MM-T885 Channel notifications: Desktop notifications mentions only', () => {
        // # Ensure notifications are set up to fire a desktop notification
        changeDesktopNotificationAs('#desktopNotificationAllActivity');

        cy.apiGetChannelByName(testTeam.name, 'Off-Topic').then(({channel}) => {
            const messageWithNotification = `random message with mention @${testUser.username}`;
            const expected = `@${otherUser.username}: ${messageWithNotification}`;

            // # Go to test channel
            cy.uiVisitSidebarItem(channel.name);

            // # Set channel notifications to show on mention only
            cy.get('#channelHeaderDropdownIcon').click();
            cy.findByText('Notification Preferences').click();
            cy.findByText('Send desktop notifications').click();
            cy.get('#channelNotificationMentions').click();
            cy.uiSaveAndClose();

            // # Visit Town square
            cy.uiVisitSidebarItem('town-square');
            spyNotificationAs('withNotification', 'granted');

            // Have another user send a post with no mention
            cy.postMessageAs({sender: otherUser, message: 'random message no mention', channelId: channel.id});

            // * Desktop notification is not received
            cy.get('@withNotification').should('not.have.been.called');

            // Have another user send a post with a mention
            cy.postMessageAs({sender: otherUser, message: messageWithNotification, channelId: channel.id});

            // * Desktop notification is received
            cy.get('@withNotification').should('have.been.calledWithMatch', 'Off-Topic', (args) => {
                expect(args.body, `Notification body: "${args.body}" should match: "${expected}"`).to.equal(expected);
                return true;
            });

            // * Notification badge is aligned to the right of LHS
            cy.get(`#sidebarItem_${channel.name} .badge`).should('exist').and('have.css', 'margin', '0px 4px');
        });
    });
});
