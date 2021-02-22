// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
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

    it('MM-T885 Channel notifications: Desktop notifications mentions only', () => {
        cy.apiCreateUser().then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            // Visit town-square.
            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Ensure notifications are set up to fire a desktop notification
            changeDesktopNotificationSettingsAs('#desktopNotificationAllActivity');

            cy.apiGetChannelByName(testTeam.name, 'Off-Topic').then(({channel}) => {
                const messageWithNotification = `random message with mention @${user.username}`;
                const expected = `@${testUser.username}: ${messageWithNotification}`;

                // # Go to Off topic
                cy.visit(`/${testTeam.name}/channels/${channel.name}`);

                // # Set channel notifications to show on mention only
                cy.get('#channelHeaderDropdownIcon').click();
                cy.findByText('Notification Preferences').click();
                cy.findByText('Send desktop notifications').click();
                cy.get('#channelNotificationMentions').click();
                cy.get('#saveSetting').click();

                // # Visit Town square
                cy.visit(`/${testTeam.name}/channels/town-square`);

                spyNotificationAs('withNotification', 'granted');

                // Have another user send a post with no mention
                cy.postMessageAs({sender: testUser, message: 'random message no mention', channelId: channel.id});

                // * Desktop notification is not received
                cy.get('@withNotification').should('not.have.been.called');

                // Have another user send a post with a mention
                cy.postMessageAs({sender: testUser, message: messageWithNotification, channelId: channel.id});

                // * Desktop notification is received
                cy.get('@withNotification').should('have.been.calledWithMatch', 'Off-Topic', (args) => {
                    expect(args.body, `Notification body: "${args.body}" should match: "${expected}"`).to.equal(expected);
                    return true;
                });

                // * Notification badge is aligned 10px to the right of LHS
                cy.get(`#sidebarItem_${channel.name} .badge`).should('exist').and('have.css', 'margin', '0px 3px 0px 6px');
            });
        });
    });

    it('MM-T488 Desktop Notifications - Teammate name display set to username', () => {
        cy.apiCreateUser({}).then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            // Visit town-square.
            cy.visit(`/${testTeam.name}/channels/town-square`);
            spyNotificationAs('withNotification', 'granted');

            // # Ensure notifications are set up to fire a desktop notification if are mentioned
            changeDesktopNotificationSettingsAs('#desktopNotificationMentions');

            // # Ensure display settings are set to "Show username"
            changeDesktopDisplaySettingsTeammateNameDisplayAs('#name_formatFormatA');

            const actualMsg = `@${user.username} How are things?`;
            const expected = `@${testUser.username}: @${user.username} How are things?`;

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

    describe('MM-T489 Desktop Notifications - Teammate name display set to nickname', () => {
        it('displays teammates nickname when nickname exists', () => {
            const nickname = 'the rock';

            // # Ensure user has a nickname set up
            cy.apiPatchUser(testUser.id, {nickname}).then(() => {
                testUser.nickname = nickname;
            });

            cy.apiCreateUser({}).then(({user}) => {
                cy.apiAddUserToTeam(testTeam.id, user.id);
                cy.apiLogin(user);

                // Visit town-square.
                cy.visit(`/${testTeam.name}/channels/town-square`);
                spyNotificationAs('withNotification', 'granted');

                // # Ensure notifications are set up to fire a desktop notification if are mentioned
                changeDesktopNotificationSettingsAs('#desktopNotificationMentions');

                // # Ensure display settings are set to "Show nickname if one exists, otherwise show first and last name"
                changeDesktopDisplaySettingsTeammateNameDisplayAs('#name_formatFormatB');

                const actualMsg = `@${user.username} How are things?`;
                const expected = `@${testUser.nickname}: @${user.username} How are things?`;

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

        it('displays teammates first and last name when nickname does not exists', () => {
            // # Ensure user has a nickname set up
            cy.apiPatchUser(testUser.id, {nickname: ''});

            cy.apiCreateUser({}).then(({user}) => {
                cy.apiAddUserToTeam(testTeam.id, user.id);
                cy.apiLogin(user);

                // Visit town-square.
                cy.visit(`/${testTeam.name}/channels/town-square`);
                spyNotificationAs('withNotification', 'granted');

                // # Ensure notifications are set up to fire a desktop notification if are mentioned
                changeDesktopNotificationSettingsAs('#desktopNotificationMentions');

                // # Ensure display settings are set to "Show nickname if one exists, otherwise show first and last name"
                changeDesktopDisplaySettingsTeammateNameDisplayAs('#name_formatFormatB');

                const actualMsg = `@${user.username} How are things?`;
                const expected = `@${testUser.first_name} ${testUser.last_name}: @${user.username} How are things?`;

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
    });

    it('MM-T490 Desktop Notifications - Teammate name display set to first and last name', () => {
        cy.apiCreateUser({}).then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            // Visit town-square.
            cy.visit(`/${testTeam.name}/channels/town-square`);
            spyNotificationAs('withNotification', 'granted');

            // # Ensure notifications are set up to fire a desktop notification if are mentioned
            changeDesktopNotificationSettingsAs('#desktopNotificationMentions');

            // # Ensure display settings are set to "Show first and last name"
            changeDesktopDisplaySettingsTeammateNameDisplayAs('#name_formatFormatC');

            const actualMsg = `@${user.username} How are things?`;
            const expected = `@${testUser.first_name} ${testUser.last_name}: @${user.username} How are things?`;

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

    it('MM-T491 - Channel notifications: No desktop notification when in focus', () => {
        cy.apiCreateUser().then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            cy.apiGetChannelByName(testTeam.name, 'Off-Topic').then(({channel}) => {
                const message = '/echo test 3';

                // # Go to Off topic
                cy.visit(`/${testTeam.name}/channels/${channel.name}`);
                spyNotificationAs('withNotification', 'granted');

                // # Have another user send a post with delay
                cy.postMessageAs({sender: testUser, message, channelId: channel.id});

                // * Desktop notification is not received
                cy.get('@withNotification').should('not.have.been.called');
            });
        });
    });

    it('MM-T494 - Channel notifications: Send Desktop Notifications - Only mentions and DMs', () => {
        cy.apiCreateUser().then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            // # Visit town-square.
            cy.visit(`/${testTeam.name}/channels/town-square`);
            spyNotificationAs('withNotification', 'granted');

            // # Ensure notifications are set up to fire a desktop notification
            changeDesktopNotificationSettingsAs('#desktopNotificationMentions');

            cy.apiGetChannelByName(testTeam.name, 'Off-Topic').then(({channel}) => {
                const messageWithoutNotification = 'message without notification';
                const messageWithNotification = `random message with mention @${user.username}`;
                const expected = `@${testUser.username}: ${messageWithNotification}`;

                // # Have another user send a post with no mention
                cy.postMessageAs({sender: testUser, message: messageWithoutNotification, channelId: channel.id});

                // * Desktop notification is not received
                cy.get('@withNotification').should('not.have.been.called');

                // Have another user send a post with a mention
                cy.postMessageAs({sender: testUser, message: messageWithNotification, channelId: channel.id});

                // * Desktop notification is received
                cy.get('@withNotification').should('have.been.calledWithMatch', 'Off-Topic', (args) => {
                    expect(args.body, `Notification body: "${args.body}" should match: "${expected}"`).to.equal(expected);
                    return true;
                });

                // # Have another user post a direct message
                cy.apiCreateDirectChannel([user.id, testUser.id]).then(({channel: dmChannel}) => {
                    cy.postMessageAs({sender: testUser, message: 'hi', channelId: dmChannel.id});

                    // * DM notification is received
                    cy.get('@withNotification').should('have.been.called');
                });
            });
        });
    });

    it('MM-T496 - Channel notifications: Send Desktop Notifications - Never', () => {
        cy.apiCreateUser().then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            // Visit town-square.
            cy.visit(`/${testTeam.name}/channels/town-square`);
            spyNotificationAs('withNotification', 'granted');

            // # Ensure notifications are set up to never fire a desktop notification
            changeDesktopNotificationSettingsAs('#desktopNotificationNever');

            cy.apiGetChannelByName(testTeam.name, 'Off-Topic').then(({channel}) => {
                const messageWithNotification = `random message with mention @${user.username}`;

                // Have another user send a post with a mention
                cy.postMessageAs({sender: testUser, message: messageWithNotification, channelId: channel.id});

                // * Desktop notification is not received
                cy.get('@withNotification').should('not.have.been.called');

                // # Have another user post a direct message
                cy.apiCreateDirectChannel([user.id, testUser.id]).then(({channel: dmChannel}) => {
                    cy.postMessageAs({sender: testUser, message: 'hi', channelId: dmChannel.id});

                    // * DM notification is not received
                    cy.get('@withNotification').should('not.have.been.called');
                });
            });
        });
    });

    it('MM-T499 - Channel notifications: Desktop Notification Sounds OFF', () => {
        cy.apiCreateUser().then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id);
            cy.apiLogin(user);

            // # Visit town-square.
            cy.visit(`/${testTeam.name}/channels/town-square`);
            spyNotificationAs('withNotification', 'granted');

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

                // # Select sound off.
                cy.get('#soundOff').check();

                // # Ensure sound dropdown is not visible
                cy.get('#displaySoundNotification').should('not.be.visible');

                // # Click "Save"
                cy.findByText('Save').scrollIntoView().should('be.visible').click();

                // # Close the modal.
                cy.get('#accountSettingsHeader').find('button').should('be.visible').click();
            });

            cy.apiGetChannelByName(testTeam.name, 'Off-Topic').then(({channel}) => {
                const messageWithNotification = `random message with mention @${user.username}`;

                // # Have another user send a post with a mention
                cy.postMessageAs({sender: testUser, message: messageWithNotification, channelId: channel.id});

                // * Desktop notification is received without sound
                cy.get('@withNotification').should('have.been.calledWithMatch', 'Off-Topic', (args) => {
                    expect(args.silent).to.equal(true);
                    return true;
                });
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

const changeDesktopDisplaySettingsTeammateNameDisplayAs = (category) => {
    // # Click hamburger main menu.
    cy.get('#sidebarHeaderDropdownButton').click();

    // # Click "Account settings"
    cy.findByText('Account Settings').should('be.visible').click();

    // * Check that the "Account Settings" modal was opened.
    cy.get('#accountSettingsModal').should('exist').within(() => {
        // # Click "Notifications"
        cy.findByText('Display').should('be.visible').click();

        // # Click "Desktop"
        cy.findByText('Teammate Name Display').should('be.visible').click();

        // # Select category.
        cy.get(category).check();

        // # Click "Save"
        cy.findByText('Save').scrollIntoView().should('be.visible').click();

        // Close the modal.
        cy.get('#accountSettingsHeader').find('button').should('be.visible').click();
    });
};
