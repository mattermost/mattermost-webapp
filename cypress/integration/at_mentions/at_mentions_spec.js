// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 4]*/
/*eslint-disable func-names*/

function setNotificationSettings(desiredSettings = {first: true, username: true, shouts: true, custom: true, customText: '@'}) {
    // Navigate to settings modal
    cy.toAccountSettingsModal(null, true);

    // Select "Notifications"
    cy.get('#notificationsButton').click();

    // Notifications header should be visible
    cy.get('#notificationSettingsTitle').
        scrollIntoView().
        should('be.visible').
        and('contain', 'Notifications');

    // Open up 'Words that trigger mentions' sub-section
    cy.get('#keysTitle').
        scrollIntoView().
        click();

    const settings = [
        {key: 'first', selector: '#notificationTriggerFirst'},
        {key: 'username', selector: '#notificationTriggerUsername'},
        {key: 'shouts', selector: '#notificationTriggerShouts'},
        {key: 'custom', selector: '#notificationTriggerCustom'},
    ];

    // Set check boxes to desired state
    settings.forEach((setting) => {
        const checkbox = desiredSettings[setting.key] ? {state: 'check', verify: 'be.checked'} : {state: 'uncheck', verify: 'not.be.checked'};
        cy.get(setting.selector)[checkbox.state]().should(checkbox.verify);
    });

    // Set Custom field
    if (desiredSettings.custom && desiredSettings.customText) {
        cy.get('#notificationTriggerCustomText').
            clear().
            type(desiredSettings.customText);
    }

    // Click “Save” and close modal
    cy.get('#saveSetting').
        scrollIntoView().
        click();
    cy.get('#accountSettingsHeader > .close').
        click().
        should('be.hidden');
}

describe('at-mention', () => {
    beforeEach(() => {
        cy.fixture('users').as('usersJSON');

        cy.get('@usersJSON').
            its('user-1').
            as('receiver');

        cy.get('@usersJSON').
            its('user-2').
            as('sender');

        // 1. Login and navigate to the app
        cy.get('@receiver').then((receiver) => {
            cy.apiLogin(receiver.username);
        });

        cy.visit('/');

        // 2. Navigate to the channel we were mention to
        // clear the notification gem and get the channelId
        cy.get('#sidebarItem_town-square').click({force: true});

        // 3. Get the current channelId
        cy.getCurrentChannelId().as('channelId');

        // 4. Navigate to a channel we are NOT going to post to
        cy.get('#sidebarItem_saepe-5').click({force: true});

        // 7. Stub out Notification so we can spy on it
        cy.window().then((win) => {
            cy.stub(win, 'Notification').as('notifyStub');
        });
    });

    it('N14571 still triggers notification if username is not listed in words that trigger mentions', function() {
        // 1. Set Notification settings
        setNotificationSettings({first: false, username: false, shouts: true, custom: true});

        const message = `@${this.receiver.username} I'm messaging you! ${Date.now()}`;

        // 2. Use another account to post a message @-mentioning our receiver
        cy.task('postMessageAs', {sender: this.sender, message, channelId: this.channelId});

        // * Verify the stub
        cy.get('@notifyStub').should((stub) => {
            const [title, opts] = stub.firstCall.args;

            // * Verify notification is coming from Town Square
            expect(title).to.equal('Town Square');

            const body = `@${this.sender.username}: ${message}`;

            // * Verify additional args of notification
            expect(opts).to.include({body, tag: body, requireInteraction: false, silent: false});
        });

        // * Verify unread mentions badge
        cy.get('#sidebarItem_town-square').
            scrollIntoView().
            find('#unreadMentions').
            should('be.visible').
            and('have.text', '1');

        // 3. Go to the channel where you were messaged
        cy.get('#sidebarItem_town-square').click();

        // 4. Get last post message text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).as('postMessageText');
        });

        // * Verify entire message
        cy.get('@postMessageText').
            should('be.visible').
            and('have.text', message);

        // * Verify highlight of username
        cy.get('@postMessageText').
            find(`[data-mention=${this.receiver.username}]`).
            should('be.visible').
            and('have.text', `@${this.receiver.username}`);
    });

    it('N14570 does not trigger notifications with "Your non-case sensitive username" unchecked', function() {
        // 1. Set Notification settings
        setNotificationSettings({first: false, username: false, shouts: true, custom: true});

        const message = `Hey ${this.receiver.username}! I'm messaging you! ${Date.now()}`;

        // 2. Use another account to post a message @-mentioning our receiver
        cy.task('postMessageAs', {sender: this.sender, message, channelId: this.channelId});

        // * Verify stub was not called
        cy.get('@notifyStub').should('be.not.called');

        // * Verify unread mentions badge does not exist
        cy.get('#sidebarItem_town-square').
            scrollIntoView().
            find('#unreadMentions').
            should('be.not.visible');

        // 3. Go to the channel where you were messaged
        cy.get('#sidebarItem_town-square').click();

        // 4. Get last post message text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).as('postMessageText');
        });

        // * Verify message contents
        cy.get('@postMessageText').
            should('be.visible').
            and('have.text', message);

        // * Verify it's not highlighted
        cy.get('@postMessageText').
            find(`[data-mention=${this.receiver.username}]`).
            should('not.exist');
    });

    it('N14572 does not trigger notifications with "channel-wide mentions" unchecked', function() {
        // 1. Set Notification settings
        setNotificationSettings({first: false, username: false, shouts: false, custom: true});

        const channelMentions = ['@here', '@all', '@channel'];

        channelMentions.forEach((mention) => {
            const message = `Hey ${mention} I'm message you all! ${Date.now()}`;

            // 2. Use another account to post a message @-mentioning our receiver
            cy.task('postMessageAs', {sender: this.sender, message, channelId: this.channelId});

            // * Verify stub was not called
            cy.get('@notifyStub').should('be.not.called');

            // * Verify unread mentions badge does not exist
            cy.get('#sidebarItem_town-square').
                scrollIntoView().
                find('#unreadMentions').
                should('be.not.visible');

            // 3. Go to the channel where you were messaged
            cy.get('#sidebarItem_town-square').click();

            // 4. Get last post message text
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).as('postMessageText');
            });

            // * Verify message contents
            cy.get('@postMessageText').
                should('be.visible').
                and('have.text', message);

            // * Verify it's not highlighted
            cy.get('@postMessageText').
                find(`[data-mention=${this.receiver.username}]`).
                should('not.exist');
        });
    });
});
