// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging @not_cloud

describe('Messaging', () => {
    let testTeam;
    let testChannelName;

    before(() => {
        cy.shouldNotRunOnCloudEdition();

        // # Update config
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLegacySidebar: true,
            },
        });

        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;

            // # Set up Demo plugin
            cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.8.0/com.mattermost.demo-plugin-0.8.0.tar.gz', true);
            cy.apiEnablePluginById('com.mattermost.demo-plugin');

            // # Login as regular user
            cy.apiLogin(user);

            // # Set up test channel with a long name
            cy.apiCreateChannel(testTeam.id, 'channel-test', 'Public channel with a long name').then(({channel}) => {
                testChannelName = channel.display_name;
            });
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    after(() => {
        // # Clean up - remove demo plugin
        cy.apiAdminLogin();
        cy.apiRemovePluginById('com.mattermost.demo-plugin');
    });

    it('MM-T134 Visual verification of tooltips on top nav, channel icons, posts', () => {
        cy.findByRole('banner', {name: 'channel header region'}).should('be.visible').as('channelHeader');

        // * Members tooltip is present
        openAndVerifyTooltip('members', 'Members');

        // * Pinned post tooltip is present
        openAndVerifyTooltip('Pinned posts', 'Pinned posts');

        // * Saved posts tooltip is present
        openAndVerifyTooltip('Saved posts', 'Saved posts');

        // * Add to favorites posts tooltip is present - un checked
        openAndVerifyTooltip('add to favorites', 'Add to Favorites');

        // * Add to favorites posts tooltip is present - checked
        cy.get('@channelHeader').findByRole('button', {name: 'add to favorites'}).should('be.visible').click();
        openAndVerifyTooltip('remove from favorites', 'Remove from Favorites');

        // * Unmute a channel tooltip is present
        cy.uiOpenChannelMenu('Mute Channel');
        openAndVerifyTooltip('Muted Icon', 'Unmute');

        // * Download file tooltip is present
        cy.findByLabelText('Upload files').attachFile('long_text_post.txt');
        cy.postMessage('test file upload');
        const downloadLink = () => cy.findByTestId('fileAttachmentList').should('be.visible').findByRole('link', {name: 'download', hidden: true});
        downloadLink().trigger('mouseover');
        verifyTooltip('Download');
        downloadLink().trigger('mouseout');

        // * Long channel name (shown truncated on the LHS)
        cy.uiGetLhsSection('CHANNELS').findByText(testChannelName).should('be.visible').as('longChannelAtSidebar');
        cy.get('@longChannelAtSidebar').trigger('mouseover');
        verifyTooltip(testChannelName);
        cy.get('@longChannelAtSidebar').trigger('mouseout');

        // * Check that the Demo plugin tooltip is present
        cy.get('@channelHeader').find('.fa-plug').should('be.visible').trigger('mouseover');
        verifyTooltip('Demo Plugin');
    });
});

function verifyTooltip(text) {
    cy.get('div.tooltip-inner').should('be.visible').and('have.text', text);
}

function openAndVerifyTooltip(name, text) {
    const reName = RegExp(name, 'i');

    // # Mouseover to the element
    cy.get('@channelHeader').findByRole('button', {name: reName}).should('be.visible').trigger('mouseover');

    // * Verify the tooltip
    verifyTooltip(text);

    // # Hide the tooltip
    cy.get('@channelHeader').findByRole('button', {name: reName}).should('be.visible').trigger('mouseout');
}
