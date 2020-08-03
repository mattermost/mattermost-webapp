// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import {getAdminAccount} from '../../support/env';

describe('Messaging', () => {
    const admin = getAdminAccount();
    let newChannel;

    before(() => {
        // # Create and visit new channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            newChannel = channel;

            cy.apiPatchMe({
                locale: 'en',
                timezone: {automaticTimezone: '', manualTimezone: 'UTC', useAutomaticTimezone: 'false'},
            });

            cy.visit(`/${team.name}/channels/${channel.name}`);
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
        cy.postMessageAs({sender: admin, message: 'Hello from Jan 5, 2020 12:30pm', channelId: newChannel.id, createAt: oldDate});

        // # Post message from yesterday
        const yesterdaysDate = Cypress.moment().subtract(1, 'days').valueOf();
        cy.postMessageAs({sender: admin, message: 'Hello from yesterday', channelId: newChannel.id, createAt: yesterdaysDate});

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
        verifyDateSeparator(1, 'Ayer');
        verifyDateSeparator(2, 'Hoy');

        // # Change user timezone which is not supported by react-intl and reload
        cy.apiPatchMe({timezone: {automaticTimezone: '', manualTimezone: 'NZ-CHAT', useAutomaticTimezone: 'false'}});
        cy.reload();

        // * Verify that it renders in "es" locale
        verifyDateSeparator(0, /^(sáb|dom)., (04|05) ene. 2020/);
    });
});
