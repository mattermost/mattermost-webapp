// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @bot_accounts

import {getRandomId} from '../../utils';

describe('Create bot', () => {
    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableBotAccountCreation: true,
            },
        });
    });

    it('MM-T1810 Create a Bot via the UI', () => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableUserAccessTokens: true,
            },
        });

        createBot();
    });

    it('MM-T1811 Create a Bot when personal access tokens are set to False', () => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableUserAccessTokens: false,
            },
        });

        createBot();
    });
});

function createBot() {
    cy.apiInitSetup().then(({team}) => {
        // # go to bot integrations page
        cy.visit(`/${team.name}/channels/town-square`);
        cy.get('#headerInfo').click();
        cy.get('#integrations a').click();
        cy.get('a.integration-option[href$="/bots"]').click();
        cy.get('#addBotAccount').click();

        // # fill+submit form
        cy.get('#username').type(`bot-${getRandomId()}`);
        cy.get('#displayName').type('Test Bot');
        cy.get('#saveBot').click();

        // * verify confirmation page
        cy.url().
            should('include', `/${team.name}/integrations/confirm`).
            should('match', /token=[a-zA-Z0-9]{26}/);

        // * verify confirmation form/token
        cy.get('div.backstage-form').
            should('include.text', 'Setup Successful').
            should((confirmation) => {
                expect(confirmation.text()).to.match(/Token: [a-zA-Z0-9]{26}/);
            });
        cy.get('#doneButton').click();
    });
}
