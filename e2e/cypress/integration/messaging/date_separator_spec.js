// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

const sysadmin = users.sysadmin;

describe('Messaging', () => {
    let newChannel;

    before(() => {
        // # Login as user-1 and set preferences for locale and timezone
        cy.apiLogin('user-1');
        cy.apiPatchMe({
            locale: 'en',
            timezone: {automaticTimezone: '', manualTimezone: 'UTC', useAutomaticTimezone: 'false'},
        });

        // # Create and visit new channel
        cy.createAndVisitNewChannel().then((channel) => {
            newChannel = channel;
        });
    });

    it('MM-21482 Date separators should translate correctly', () => {
        function verifyDateSeparator(index, match) {
            cy.findAllByTestId('basicSeparator').eq(index).within(() => {
                cy.findByText(match);
            });
        }

        // # Post a message with old date
        const oldDate = Date.UTC(2020, 0, 5, 12, 30); // Jan 5, 2020 12:30pm
        cy.postMessageAs({sender: sysadmin, message: 'Hello from Jan 5, 2020 12:30pm', channelId: newChannel.id, createAt: oldDate});

        // # Post message from yesterday
        const yesterdaysDate = Cypress.moment().subtract(1, 'days').valueOf();
        cy.postMessageAs({sender: sysadmin, message: 'Hello from yesterday', channelId: newChannel.id, createAt: yesterdaysDate});

        // # Post a message for today
        cy.postMessage('Hello from today');

        // # Reload to re-arrange post order
        cy.reload();

        // * Verify that the date separators are rendered in English
        verifyDateSeparator(0, /^(Sat|Sun), Jan (04|05), 2020/);
        verifyDateSeparator(1, 'Yesterday');
        verifyDateSeparator(2, 'Today');

        // # Change user locale to "es" and reload
        cy.apiPatchMe({locale: 'es'});
        cy.reload();

        // * Verify that the date separators are rendered in Spanish
        verifyDateSeparator(0, /^(sáb|dom)., (04|05) ene. 2020/);
        verifyDateSeparator(1, 'Yesterday');
        verifyDateSeparator(2, 'Today');

        // # Change user timezone which is not supported by react-intl and reload
        cy.apiPatchMe({timezone: {automaticTimezone: '', manualTimezone: 'NZ-CHAT', useAutomaticTimezone: 'false'}});
        cy.reload();

        // * Verify that it renders in English as default and in short format of "ddd, MMM D, YYYY"
        verifyDateSeparator(0, /^(Sun|Mon), Jan (5|6), 2020/);
    });
});
