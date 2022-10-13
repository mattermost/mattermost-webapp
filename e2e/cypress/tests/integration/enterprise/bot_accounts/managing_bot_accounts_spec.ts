// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @bot_accounts

import {AdminConfig} from '@mattermost/types/lib/config';

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Managing bot accounts', () => {
    let botName: string;
    let origConfig: AdminConfig;

    beforeEach(() => {
        cy.apiRequireLicenseForFeature('LDAP');

        cy.apiAdminLogin();

        cy.apiGetConfig().then(({config}) => {
            origConfig = config;
            const newConfig = {
                ...origConfig,
                ServiceSettings: {
                    ...origConfig.ServiceSettings,
                    EnableBotAccountCreation: true,
                },
            };

            cy.apiUpdateConfig(newConfig);
        });

        cy.apiCreateBot({prefix: 'bot'}).then(({bot}) => {
            botName = bot.username;
        });
    });

    it('MM-T1855 Bot cannot login', () => {
        cy.apiLogout();
        cy.visit('/login');

        // # Remove autofocus from login input
        cy.get('.login-body-card-content').should('be.visible').focus();

        // # Enter bot name in the email field
        cy.findByPlaceholderText('Email, Username or AD/LDAP Username', {timeout: TIMEOUTS.ONE_MIN}).clear().type(botName);

        // # Enter random password in the password field
        cy.findByPlaceholderText('Password').clear().type('invalidPassword@#%(^!');

        // # Hit enter to login
        cy.get('#saveSetting').should('not.be.disabled').click();

        // * Verify appropriate error message is displayed for bot login
        cy.findByText('Bot login is forbidden.').should('exist').and('be.visible');
    });
});
