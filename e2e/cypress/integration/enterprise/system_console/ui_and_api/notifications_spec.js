// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod @smoke
// Group: @enterprise @system_console

describe('System Console', () => {
    before(() => {
        // * Login as sysadmin and check if server has license for ID Loaded Push Notifications
        cy.apiLogin('sysadmin');
        cy.requireLicenseForFeature('IDLoadedPushNotifications');

        // # Update to default config
        cy.apiUpdateConfig({
            EmailSettings: {
                PushNotificationContents: 'full',
            },
        });

        // #  Visit Notifications admin console page
        cy.visit('/admin_console/environment/notifications');
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Notifications');
    });

    it('Push Notification Contents', () => {
        // * Verify that setting is visible and matches text content
        cy.findByTestId('EmailSettings.PushNotificationContents').
            scrollIntoView().should('be.visible').
            find('label').should('be.visible').and('have.text', 'Push Notification Contents:');

        // * Verify that the help text is visible and matches text content
        cy.findByTestId('EmailSettings.PushNotificationContentshelp-text').should('be.visible').within((el) => {
            const contents = [
                'Generic description with only sender name',
                ' - Includes only the name of the person who sent the message in push notifications, with no information about channel name or message contents. ',
                'Generic description with sender and channel names',
                ' - Includes the name of the person who sent the message and the channel it was sent in, but not the message contents. ',
                'Full message content sent in the notification payload',
                ' - Includes the message contents in the push notification payload that is relayed through Apple\'s Push Notification Service (APNS) or Google\'s Firebase Cloud Messaging (FCM). It is ',
                'highly recommended',
                ' this option only be used with an "https" protocol to encrypt the connection and protect confidential information sent in messages.',
                'Full message content fetched from the server on receipt',
                ' - The notification payload relayed through APNS or FCM contains no message content, instead it contains a unique message ID used to fetch message content from the server when a push notification is received by a device. If the server cannot be reached, a generic notification will be displayed.',
            ];
            cy.wrap(el).should('have.text', contents.join(''));

            cy.get('strong').eq(0).should('have.text', contents[0]);
            cy.get('strong').eq(1).should('have.text', contents[2]);
            cy.get('strong').eq(2).should('have.text', contents[4]);
            cy.get('strong').eq(3).should('have.text', contents[6]);
            cy.get('strong').eq(4).should('have.text', contents[8]);
        });

        // * Verify that the option/dropdown is visible and has default value
        cy.findByTestId('EmailSettings.PushNotificationContentsdropdown').
            should('be.visible').
            and('have.value', 'full');

        const options = [
            {label: 'Generic description with only sender name', value: 'generic_no_channel'},
            {label: 'Generic description with sender and channel names', value: 'generic'},
            {label: 'Full message content sent in the notification payload', value: 'full'},
            {label: 'Full message content fetched from the server on receipt', value: 'id_loaded'},
        ];

        // # Select each value and save
        // * Verify that the config is correctly saved in the server
        options.forEach((option) => {
            cy.findByTestId('EmailSettings.PushNotificationContentsdropdown').
                select(option.label).
                and('have.value', option.value);
            cy.get('#saveSetting').click();

            cy.apiGetConfig().then((response) => {
                expect(response.body.EmailSettings.PushNotificationContents).to.equal(option.value);
            });
        });
    });
});
