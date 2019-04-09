// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {getRandomInt} from '../../utils';

describe('Integrations page', () => {
    before(() => {
        // 1. Login
        cy.apiLogin('sysadmin');
        cy.visit('/');

        // 2. Enable integrations in system console
        cy.enableIntegrations();
        cy.visit('/');

        // 3. Go to integrations
        cy.toIntegrationSettings();

        // * Validate that all sections are enabled
        cy.get('.section').should('have.length', 5);
    });

    it('should should display correct message when incoming webhook not found', () => {
        // 3. Open incoming web hooks page
        cy.get(':nth-child(1) > .section-title > .section-title__text > span').click();

        // 4. Add web 'include', '/newPage'hook
        cy.get('.btn').click();

        // 5. Pick the channel
        cy.selectOption('select', 1);

        // 6. Save
        cy.get('.btn-primary').click();

        // * Validate that save succeeded
        cy.get('.backstage-form__title > span').contains('Setup Successful');

        // 7. Close the Add dialog
        cy.get('.btn').click();

        // 8. Type random stuff into the search box
        cy.get('.form-control').type('some random stuff{enter}');

        // * Validate that the correct empty message is shown
        cy.get('.backstage-list__empty').should('be.visible').contains('No incoming webhooks match some random stuff');
    });

    it('should should display correct message when outgoing webhook not found', () => {
        // 3. Open outgoing web hooks page
        cy.get(':nth-child(2) > .section-title > .section-title__text > span').click();

        // 4. Add web hook
        cy.get('.btn').click();

        // 5. Pick the channel and dummy callback
        cy.selectOption('div.backstage-body > div.backstage-content > div.backstage-form > form > div:nth-child(4) > div > select', 1);
        cy.get('#callbackUrls').type('https://dummy');

        // 6. Save
        cy.get('.btn-primary').click();

        // * Validate that save succeeded
        cy.get('.backstage-form__title > span').contains('Setup Successful');

        // 7. Close the Add dialog
        cy.get('.btn').click();

        // 8. Type random stuff into the search box
        cy.get('.form-control').type('some random stuff{enter}');

        // * Validate that the correct empty message is shown
        cy.get('.backstage-list__empty').should('be.visible').contains('No outgoing webhooks match some random stuff');
    });

    it('should should display correct message when slash command not found', () => {
        // 3. Open slash command page
        cy.get(':nth-child(3) > .section-title > .section-title__text > span').click();

        // 4. Add new command
        cy.get('.btn').click();

        // 5. Pick a dummy trigger and callback
        cy.get('#trigger').type(`test-trigger${getRandomInt(10000)}`);
        cy.get('#url').type('https://dummy');

        // 6. Save
        cy.get('.btn-primary').click();

        // * Validate that save succeeded
        cy.get('.backstage-form__title > span').contains('Setup Successful');

        // 7. Close the Add dialog
        cy.get('.btn').click();

        // 8. Type random stuff into the search box
        cy.get('.form-control').type('some random stuff{enter}');

        // * Validate that the correct empty message is shown
        cy.get('.backstage-list__empty').should('be.visible').contains('No commands match some random stuff');
    });

    it('should should display correct message when slash command not found', () => {
        // 3. Open slash command page
        cy.get(':nth-child(4) > .section-title > .section-title__text > span').click();

        // 4. Add new command
        cy.get('.btn').click();

        // 5. Fill in dummy details
        cy.get('#name').type(`test-name${getRandomInt(10000)}`);
        cy.get('#description').type(`test-descr${getRandomInt(10000)}`);
        cy.get('#homepage').type(`https://dummy${getRandomInt(10000)}`);
        cy.get('#callbackUrls').type('https://dummy');

        // 6. Save
        cy.get('.btn-primary').click();

        // * Validate that save succeeded
        cy.get('.backstage-form__title > span').contains('Setup Successful');

        // 7. Close the Add dialog
        cy.get('.btn').click();

        // 8. Type random stuff into the search box
        cy.get('.form-control').type('some random stuff{enter}');

        // * Validate that the correct empty message is shown
        cy.get('.backstage-list__empty').should('be.visible').contains('No OAuth 2.0 Applications match some random stuff');
    });

    it('should should display correct message when bot account not found', () => {
        // 3. Open  bot account page
        cy.get(':nth-child(5) > .section-title > .section-title__text > span').click();

        // 4. Add new bot
        cy.get('.btn').click();

        // 5. Fill in dummy details
        cy.get('#username').type(`test-bot${getRandomInt(10000)}`);

        // 6. Save
        cy.get('.backstage-form__footer > .btn-primary').click();

        // * Make sure we are done saving
        cy.location('pathname', {timeout: 60000}).should('match', new RegExp('bots$'));

        // 7. Type random stuff into the search box
        cy.get('.form-control').type('some random stuff{enter}');

        // * Validate that the correct empty message is shown
        cy.get('.backstage-list__empty').should('be.visible').contains('No bot accounts match some random stuff');
    });
});
