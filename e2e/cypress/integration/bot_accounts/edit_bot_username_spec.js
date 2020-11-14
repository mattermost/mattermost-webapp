// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @bot_accounts

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getRandomId} from '../../utils';

describe('Edit bot username', () => {
    let testTeam;
    let botName;
    let newbotName;

    // # Login as admin and visit town-square
    before(() => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnableBotAccountCreation: true,
                DisableBotsWhenOwnerIsDeactivated: true,
            },
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        };
        cy.apiUpdateConfig(newSettings);

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
        });
    });

    it('MM-T2923 Edit bot username.', () => {
        // # Visit bot config
        cy.visit('/admin_console/integrations/bot_accounts');

        // # Verify that the setting is enabled
        cy.findByTestId('ServiceSettings.EnableBotAccountCreationtrue', {timeout: TIMEOUTS.ONE_MIN}).should('be.checked');

        // # Visit the integrations
        cy.visit(`/${testTeam.name}/integrations/bots`);

        // * Assert that adding bots possible
        cy.get('#addBotAccount', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();

        botName = `bot-${getRandomId()}`;

        // # fill+submit form
        cy.get('#username').clear().type(botName);
        cy.get('#displayName').clear().type('Test Bot');
        cy.get('#saveBot').click();
        cy.get('#doneButton').click();

        // * Set alias for bot entry in bot list, this also checks that the bot entry exists
        cy.get('.backstage-list__item').contains('.backstage-list__item', botName).as('botEntry');

        cy.get('@botEntry').then((el) => {
            // # Find the edit link for the bot
            const editLink = el.find('.item-actions>a');

            if (editLink.text() === 'Edit') {
                // # Click the edit link for the bot
                cy.wrap(editLink).click();

                // * Check that user name is as expected
                cy.get('#username').should('have.value', botName);

                // * Check that the display name is correct
                cy.get('#displayName').should('have.value', 'Test Bot');

                // * Check that description is empty
                cy.get('#description').should('have.value', '');

                newbotName = `bot-${getRandomId()}`;

                // * Enter the new user name
                cy.get('#username').clear().type(newbotName);

                // # Click update button
                cy.get('#saveBot').click();
            }
        }).then(() => {
            // * Set alias for bot entry in bot list, this also checks that the bot entry exists
            cy.get('.backstage-list__item').contains('.backstage-list__item', newbotName).as('newbotEntry');

            // * Get bot entry in bot list by username
            cy.get('@newbotEntry').then((el) => {
                cy.wrap(el).scrollIntoView();
            });
        });
    });
});
