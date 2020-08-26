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

    it('MM-T495 Desktop Notifications - Can set to DND and no notification fires on DM', () => {
        cy.apiCreateUser({}).then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            cy.apiCreateDirectChannel([testUser.id, user.id]).then((res) => {
                const channel = res.body;

                // Mock window.Notification to check if desktop notifications are triggered.
                cy.visit(`/${testTeam.name}/channels/town-square`, {
                    onBeforeLoad(win) {
                        cy.stub(win.Notification, 'permission', 'granted');
                        cy.stub(win, 'Notification').as('Notification');
                    },
                });

                // # Ensure notifications are set up to fire a desktop notification if you receive a DM
                cy.apiPatchUser(user.id, {notify_props: {...user.notify_props, desktop: 'all'}});

                // # Post the following: /dnd
                cy.get('#post_textbox').clear().type('/dnd{enter}');

                // # Have another user send you a DM
                cy.postMessageAs({sender: testUser, message: MESSAGES.TINY, channelId: channel.id});

                // * Desktop notification is not received
                cy.wait(TIMEOUTS.HALF_SEC);
                cy.get('@Notification').should('not.have.been.called');
            });
        });
    });
});
