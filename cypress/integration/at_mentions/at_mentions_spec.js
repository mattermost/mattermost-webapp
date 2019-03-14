// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 4]*/

describe('at-mention', () => {
    it('N14571 still triggers notification if username is not listed in words that trigger mentions', () => {
        cy.fixture('users').then((users) => {
            const receiver = users['user-1'];
            const sender = users['user-2'];

            // 1. Login and navigate to the account settings
            cy.toAccountSettingsModal(receiver.username);

            // 2. Select "Notifications"
            cy.get('#notificationsButton').click();

            // * Notifications header should be visible
            cy.get('#notificationSettingsTitle').should('be.visible').should('contain', 'Notifications');

            // 3. Open up 'Words that trigger mentions' sub-section
            cy.get('#keysTitle').scrollIntoView();
            cy.get('#keysTitle').click();

            // 4. Set checkboxes to desired state
            cy.get('#notificationTriggerFirst').uncheck().should('not.be.checked');
            cy.get('#notificationTriggerUsername').uncheck().should('not.be.checked');
            cy.get('#notificationTriggerShouts').check().should('be.checked');
            cy.get('#notificationTriggerCustom').check().should('be.checked');

            // 5. Set Custom field to not include our name
            cy.get('#notificationTriggerCustomText').clear().type('@');

            // 6. Click “Save” and close modal
            cy.get('#saveSetting').scrollIntoView().click();
            cy.get('#accountSettingsHeader > .close').click();

            // 7. Navigate to the channel we were mention to clear the notification gem
            cy.get('#sidebarItem_town-square').click();

            // 8. Navigate to a channel we are NOT going to post to
            cy.get('#sidebarItem_saepe-5').click({force: true});

            // 9. Stub out Notification so we can spy on it
            cy.window().then((win) => {
                cy.stub(win, 'Notification').as('notifyStub');
            });

            // Town Square Channel Id
            const channelId = 'qxj8bebmjib9fjgexdgoepod3y';

            const message = `@${receiver.username} I'm messaging you! ${Date.now()}`;

            // 10. Use another account to post a message @-mentioning our receiver
            cy.task('postMessageAs', {sender, message, channelId});

            // * Verify the stub
            cy.get('@notifyStub').should((stub) => {
                const [title, opts] = stub.firstCall.args;

                // * Verify notification is coming from Town Square
                expect(title).to.equal('Town Square');

                const body = `@${sender.username}: ${message}`;

                // * Verify additional args of notification
                expect(opts).to.include({body, tag: body, requireInteraction: false, silent: false});
            });

            // * Verify unread mentions badge
            cy.get('#sidebarItem_town-square').find('#unreadMentions').should('be.visible').and('have.text', '1');
        });
    });
});