// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    let testTeam;

    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;

            // # Set up Demo plugin
            cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.8.0/com.mattermost.demo-plugin-0.8.0.tar.gz', true);
            cy.apiEnablePluginById('com.mattermost.demo-plugin');

            // # Login as regular user
            cy.apiLogin(user);

            // # Set up test channel with a long name
            cy.apiCreateChannel(testTeam.id, 'channel-test', 'Public channel with a long name');
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    after(() => {
        // # Clean up - remove demo plugin
        cy.apiAdminLogin();
        cy.apiRemovePluginById('com.mattermost.demo-plugin');
    });

    it('MM-T134 Visual verification of tooltips on top nav, channel icons, posts', () => {
        // * Hover effect wraps around Date and New Messages lines
        cy.get('#postListContent').find('.top').should('be.visible');

        // * Members tool-tip is present
        cy.findAllByLabelText('members').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Members');
        cy.findAllByLabelText('members').should('be.visible').trigger('mouseout');

        // * Pinned post tool-tip is present
        cy.findAllByLabelText('Pinned posts').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Pinned posts');
        cy.findAllByLabelText('Pinned posts').should('be.visible').trigger('mouseout');

        // * Saved posts tool-tip is present
        cy.findAllByLabelText('Saved posts').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Saved posts');
        cy.findAllByLabelText('Saved posts').should('be.visible').trigger('mouseout');

        // * Add to favourites posts tool-tip is present - un checked
        cy.findAllByLabelText('add to favorites').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Add to Favorites');
        cy.findAllByLabelText('add to favorites').should('be.visible').trigger('mouseout');

        // * Add to favourites posts tool-tip is present - checked
        cy.findAllByLabelText('add to favorites').click();
        cy.findAllByLabelText('remove from favorites').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Remove from Favorites');
        cy.findAllByLabelText('remove from favorites').should('be.visible').trigger('mouseout');

        // * Unmute a channel tool-tip is present
        cy.findAllByLabelText('dropdown icon').click();
        cy.findAllByText('Mute Channel').click();
        cy.findAllByLabelText('Muted Icon').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Unmute');
        cy.findAllByLabelText('Muted Icon').should('be.visible').trigger('mouseout');

        // * Download file tooltip is present
        cy.findAllByLabelText('Upload files').attachFile('long_text_post.txt');
        cy.postMessage('test file upload');
        cy.findAllByLabelText('download').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Download');
        cy.findAllByLabelText('download').should('be.visible').trigger('mouseout');

        // * Long channel name (shown truncated on the LHS)
        cy.get('.sidebar-item__name').contains('long name').should('be.visible').trigger('mouseover');
        cy.get('div.tooltip-inner').should('be.visible').and('contain', 'Public channel with a long name');
        cy.get('.sidebar-item__name').contains('long name').should('be.visible').trigger('mouseout');

        // * Check that the Demo plugin tool-tip is present
        cy.get('#channel-header').find('.fa-plug').should('be.visible').trigger('mouseover');
        cy.get('#pluginTooltip').should('be.visible').and('have.text', 'Demo Plugin');
    });
});
