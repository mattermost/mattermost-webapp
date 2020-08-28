// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @notifications

import * as MESSAGES from '../../fixtures/messages';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Desktop notifications', () => {
    let testTeam;
    let testUser;

    before(() => {
        // Initialise a user.
        cy.apiInitSetup({}).then(({team, user}) => {
            testUser = user;
            testTeam = team;
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin();
    });

    it('Check Desktop Notification mocking works', () => {
        cy.apiCreateUser({}).then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            cy.apiCreateDirectChannel([testUser.id, user.id]).then((res) => {
                const channel = res.body;

                // Ensure notifications are set up to fire a desktop notification if you receive a DM
                cy.apiPatchUser(user.id, {notify_props: {...user.notify_props, desktop: 'all'}});

                // Visit the MM webapp with the notification API stubbed.
                cy.visit(`/${testTeam.name}/channels/town-square`);
                stubNotificationAs('withNotification', 'granted');

                // Make sure user is marked as online.
                cy.get('#post_textbox').clear().type('/online{enter}');

                // Have another user send you a DM to trigger a Desktop Notification.
                cy.postMessageAs({sender: testUser, message: MESSAGES.TINY, channelId: channel.id});

                // Desktop notification should be received.
                cy.wait(TIMEOUTS.HALF_SEC);
                cy.get('@withNotification').should('have.been.calledOnce');
            });
        });
    });

    it('MM-T495 Desktop Notifications - Can set to DND and no notification fires on DM', () => {
        cy.apiCreateUser({}).then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            cy.apiCreateDirectChannel([testUser.id, user.id]).then((res) => {
                const channel = res.body;

                // # Ensure notifications are set up to fire a desktop notification if you receive a DM
                cy.apiPatchUser(user.id, {notify_props: {...user.notify_props, desktop: 'all'}});

                // Visit the MM webapp with the notification API stubbed.
                cy.visit(`/${testTeam.name}/channels/town-square`);
                stubNotificationAs('withoutNotification', 'granted');

                // # Post the following: /dnd
                cy.get('#post_textbox').clear().type('/dnd{enter}');

                // # Have another user send you a DM
                cy.postMessageAs({sender: testUser, message: MESSAGES.TINY, channelId: channel.id});

                // * Desktop notification is not received
                cy.wait(TIMEOUTS.HALF_SEC);
                cy.get('@withoutNotification').should('not.have.been.called');

                // * Verify that the status indicator next to your name has changed to "Do Not Disturb"
                cy.get('button[aria-label="set status"] > span > svg').
                    should('have.attr', 'aria-label', 'Do Not Disturb Icon');
            });
        });
    });
});

const stubNotificationAs = (name, permission) => {
    // Mock window.Notification to check if desktop notifications are triggered.
    cy.window().then((win) => {
        function Notification(title, opts) {
            this.title = title;
            this.opts = opts;
        }

        Notification.requestPermission = () => permission;
        Notification.close = () => true;

        win.Notification = Notification;

        cy.stub(win, 'Notification').as(name);
    });
};
