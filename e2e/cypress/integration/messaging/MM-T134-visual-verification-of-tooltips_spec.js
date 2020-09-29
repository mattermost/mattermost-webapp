// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

const timestamp = Date.now();

function verifyChannel(res, verifyExistence = true) {
    const channel = res.body;

    // # Hover on the channel name
    cy.get(`#sidebarItem_${channel.name}`).should('be.visible').trigger('mouseover');

    // * Verify that the tooltip is displayed
    if (verifyExistence) {
        cy.get('div.tooltip-inner').
            should('be.visible').
            and('contain', channel.display_name);
    } else {
        cy.get('div.tooltip-inner').should('not.exist');
    }
}

describe('Messaging', () => {
    let loggedUser;

    let testTeam;

    before(() => {
        // # Login as test user and visit the newly created test channel

        cy.apiInitSetup({loginAfter: false}).then(({team, user}) => {
            testTeam = team;
            loggedUser = user;

            cy.apiAdminLogin;

            cy.apiAddUserToTeam(testTeam.id, loggedUser.id);

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });
    it('MM-T134-visual-verification-of-tooltips', () => {
        // * Hover effect wraps around Date and New Messages lines
        // supposed to validate shadow over effect wraping around date but not sure if this is possible
        cy.get('#postListContent').find('.top').should('be.visible');

        // * Members tool-tip is present
        cy.findAllByLabelText('members').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Members');
        cy.findAllByLabelText('members').should('be', 'visible').trigger('mouseout');

        // * Pinned post tool-tip is present
        cy.findAllByLabelText('Pinned posts').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Pinned posts');
        cy.findAllByLabelText('Pinned posts').should('be', 'visible').trigger('mouseout');

        // * Saved posts tool-tip is present
        cy.findAllByLabelText('Saved posts').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Saved posts');
        cy.findAllByLabelText('Saved posts').should('be', 'visible').trigger('mouseout');

        // * Add to favourites posts tool-tip is present - un checked
        cy.findAllByLabelText('add to favorites').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Add to Favorites');
        cy.findAllByLabelText('add to favorites').should('be', 'visible').trigger('mouseout');

        // * Add to favourites posts tool-tip is present - checked
        cy.findAllByLabelText('add to favorites').click();
        cy.findAllByLabelText('remove from favorites').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Remove from Favorites');
        cy.findAllByLabelText('remove from favorites').should('be', 'visible').trigger('mouseout');

        // * Unmute a channel tool-tip is present
        cy.findAllByLabelText('dropdown icon').click();
        cy.findAllByText('Mute Channel').click();
        cy.findAllByLabelText('Muted Icon').should('be', 'visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Unmute');
        cy.findAllByLabelText('Muted Icon').should('be', 'visible').trigger('mouseout');

        // * Long channel name (shown truncated on the LHS)
        cy.apiCreateChannel(testTeam.id, 'channel-test', `Public channel with a long name-${timestamp}`).then((res) => {
            verifyChannel(res);
        });

        // # Set up the Demo plugin
        cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.8.0/com.mattermost.demo-plugin-0.8.0.tar.gz', true);
        cy.visit('/admin_console/plugins/plugin_com.mattermost.demo-plugin');
        cy.get('[data-testid="PluginSettings.PluginStates.com+mattermost+demo-plugin.Enabletrue"]').check().should('be', 'checked');
        cy.get('#saveSetting').click({force: true});
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // * Check that the Demo plugin tool-tip is present
        cy.get('#channel-header').find('.fa-plug').should('be.visible').trigger('mouseover');
        cy.get('#pluginTooltip').should('be.visible').and('have.text', 'Demo Plugin');
    });
});
