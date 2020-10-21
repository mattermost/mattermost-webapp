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
import {getEmailUrl} from '../../utils';
import {spyNotificationAs} from '../../support/notification';

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

            cy.apiCreateDirectChannel([testUser.id, user.id]).then(({channel}) => {
                // Ensure notifications are set up to fire a desktop notification if you receive a DM
                cy.apiPatchUser(user.id, {notify_props: {...user.notify_props, desktop: 'all'}});

                // Visit the MM webapp with the notification API stubbed.
                cy.visit(`/${testTeam.name}/channels/town-square`);
                spyNotificationAs('withNotification', 'granted');

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

    it('MM-T482 Desktop Notifications - (at) here not rec\'d when logged off', () => {
        cy.apiCreateUser().then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            // Visit town-square.
            cy.visit(`/${testTeam.name}/channels/town-square`);
            spyNotificationAs('withoutNotification', 'granted');

            // # Ensure notifications are set up to fire a desktop notification if are mentioned.
            changeDesktopNotificationSettingsAs('#desktopNotificationMentions');

            cy.apiGetChannelByName(testTeam.name, 'Off-Topic').then(({channel}) => {
                // # Logout the user.
                cy.apiLogout().wait(TIMEOUTS.TEN_SEC);

                // Have another user send a post.
                cy.postMessageAs({sender: testUser, message: '@here', channelId: channel.id});
            });

            // # Login with the user.
            cy.apiLogin(user).then(() => {
                // Visit town-square.
                cy.visit(`/${testTeam.name}/channels/town-square`);

                // * Desktop notification is not received.
                cy.wait(TIMEOUTS.HALF_SEC);
                cy.get('@withoutNotification').should('not.have.been.called');

                // * Should not have unread mentions indicator.
                cy.get('#sidebarItem_off-topic').
                    scrollIntoView().
                    find('#unreadMentions').
                    should('not.exist');

                // # Verify that off-topic channel is unread and then click.
                cy.findByLabelText('off-topic public channel unread').
                    should('exist').
                    click();

                // # Get last post message text
                cy.getLastPostId().then((postId) => {
                    cy.get(`#postMessageText_${postId}`).as('postMessageText');
                });

                // * Verify message has @here mention and it is highlighted.
                cy.get('@postMessageText').
                    find('[data-mention="here"]').
                    should('exist');
            });

            const baseUrl = Cypress.config('baseUrl');
            const mailUrl = getEmailUrl(baseUrl);

            // * Verify no email notification received for the mention.
            cy.task('getRecentEmail', {username: user.username, mailUrl}).then((response) => {
                const {data, status} = response;

                // # Should return success status.
                expect(status).to.equal(200);

                // # Verify that only joining to mattermost e-mail exist.
                expect(data.to.length).to.equal(1);
                expect(data.to[0]).to.contain(user.email);

                // # Verify that the email subject is about joining.
                expect(data.subject).to.contain('You joined');
            });
        });
    });

    it('MM-T487 Desktop Notifications - For all activity with apostrophe, emoji, and markdown in notification', () => {
        cy.apiCreateUser().then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            // Visit the MM webapp with the notification API stubbed.
            cy.visit(`/${testTeam.name}/channels/town-square`);
            spyNotificationAs('withNotification', 'granted');

            const actualMsg = '*I\'m* [hungry](http://example.com) :taco: ![Mattermost](http://www.mattermost.org/wp-content/uploads/2016/03/logoHorizontal.png)';
            const expected = '@' + testUser.username + ': I\'m hungry :taco: Mattermost';

            // # Ensure notifications are set up to fire a desktop notification if are mentioned.
            changeDesktopNotificationSettingsAs('#desktopNotificationAllActivity');

            cy.apiGetChannelByName(testTeam.name, 'Off-Topic').then(({channel}) => {
                // # Have another user send a post.
                cy.postMessageAs({sender: testUser, message: actualMsg, channelId: channel.id});

                // * Desktop notification should be received with expected body.
                cy.wait(TIMEOUTS.HALF_SEC);
                cy.get('@withNotification').should('have.been.calledWithMatch', 'Off-Topic', (args) => {
                    expect(args.body, `Notification body: "${args.body}" should match: "${expected}"`).to.equal(expected);
                    return true;
                });
            });
        });
    });

    it('MM-T495 Desktop Notifications - Can set to DND and no notification fires on DM', () => {
        cy.apiCreateUser({}).then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            cy.apiCreateDirectChannel([testUser.id, user.id]).then(({channel}) => {
                // # Ensure notifications are set up to fire a desktop notification if you receive a DM
                cy.apiPatchUser(user.id, {notify_props: {...user.notify_props, desktop: 'all'}});

                // Visit the MM webapp with the notification API stubbed.
                cy.visit(`/${testTeam.name}/channels/town-square`);
                spyNotificationAs('withoutNotification', 'granted');

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

    it('MM-T497 Desktop Notifications for empty string without mention badge', () => {
        cy.apiCreateUser({}).then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            // # Visit the MM webapp with the notification API stubbed.
            cy.visit(`/${testTeam.name}/channels/town-square`);
            spyNotificationAs('withNotification', 'granted');

            const actualMsg = '---';
            const expected = '@' + testUser.username + ' did something new';

            // # Ensure notifications are set up to fire a desktop notification for all activity.
            changeDesktopNotificationSettingsAs('#desktopNotificationAllActivity');

            cy.apiGetChannelByName(testTeam.name, 'Off-Topic').then(({channel}) => {
                // # Have another user send a post.
                cy.postMessageAs({sender: testUser, message: actualMsg, channelId: channel.id});

                // * Desktop notification should be received with expected body.
                cy.wait(TIMEOUTS.HALF_SEC);
                cy.get('@withNotification').should('have.been.calledWithMatch', 'Off-Topic', (args) => {
                    expect(args.body, `Notification body: "${args.body}" should match: "${expected}"`).to.equal(expected);
                    return true;
                });

                // * Verify that the channel is now unread without a mention badge
                cy.get(`#sidebarItem_${channel.name} .badge`).should('not.exist');
            });
        });
    });
});

const changeDesktopNotificationSettingsAs = (category) => {
    // # Click hamburger main menu.
    cy.get('#sidebarHeaderDropdownButton').click();

    // # Click "Account settings"
    cy.findByText('Account Settings').should('be.visible').click();

    // * Check that the "Account Settings" modal was opened.
    cy.get('#accountSettingsModal').should('exist').within(() => {
        // # Click "Notifications"
        cy.findByText('Notifications').should('be.visible').click();

        // # Click "Desktop"
        cy.findByText('Desktop Notifications').should('be.visible').click();

        // # Select category.
        cy.get(category).check();

        // # Click "Save"
        cy.findByText('Save').scrollIntoView().should('be.visible').click();

        // Close the modal.
        cy.get('#accountSettingsHeader').find('button').should('be.visible').click();
    });
};
