// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @not_cloud @messaging

describe('Header', () => {
    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.shouldHavePluginUploadEnabled();

        // # Enable Bots and plugins
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableBotAccountCreation: true,
            },
            PluginSettings: {
                Enable: true,
            },
        });

        // # Setup and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T1837_1 - DM channel with bot displays a normal header', () => {
        // # Create a bot
        cy.apiCreateBot().then(({bot}) => {
            // # Open a DM with the bot
            cy.uiAddDirectMessage().click();
            cy.get('.more-modal__list .more-modal__row');
            cy.get('#moreDmModal input').
                type(bot.username, {force: true}).
                type('{enter}', {force: true});
            cy.get('#selectItems').contains(bot.username);
            cy.get('#saveItems').click();

            // * Verify Channel Header is visible
            cy.get('#channelHeaderInfo').should('be.visible');

            // * Verify header content
            cy.get('#channelHeaderDescription > .header-description__text').find('p').should('have.text', bot.description);
        });
    });

    it('MM-T1837_2 - DM channel with bot from plugin displays a normal header', () => {
        // # Try to remove the plugin, just in case
        cy.apiRemovePluginById('com.github.matterpoll.matterpoll');

        // # Upload and enable "matterpoll" plugin
        cy.apiUploadPlugin('com.github.matterpoll.matterpoll.tar.gz', 0).then(() => {
            cy.apiEnablePluginById('com.github.matterpoll.matterpoll');
        });

        // # Open a DM with the bot
        cy.uiAddDirectMessage().click();
        cy.get('.more-modal__list .more-modal__row');
        cy.get('#moreDmModal input').
            type('matterpoll', {force: true}).
            type('{enter}', {force: true});
        cy.get('#selectItems').contains('matterpoll');
        cy.get('#saveItems').click();

        // * Verify Channel Header is visible
        cy.get('#channelHeaderInfo').should('be.visible');

        // * Verify header content
        cy.get('#channelHeaderDescription > .header-description__text').find('p').should('have.text', 'Poll Bot');

        // # Clean up, uninstall "matterpoll" plugin
        cy.apiRemovePluginById('com.github.matterpoll.matterpoll');
    });
});
