// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @plugin

/**
 * Note : This test requires two demo plugin tar files under fixtures folder.
 * Download version 0.1.0 from :
 * https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.9.0/com.mattermost.demo-plugin-0.1.0.tar.gz
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.demo-plugin-0.9.0.tar.gz
 */

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Demo plugin - Webhook events', () => {
    const pluginId = 'com.mattermost.demo-plugin';
    const pluginName = 'com.mattermost.demo-plugin-0.9.0.tar.gz';

    let testTeam;
    let testUser;
    let admin;
    let testChannel;
    let newTeam;

    before(() => {
        // # Set plugin settings
        const newSettings = {
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        };
        cy.apiUpdateConfig(newSettings);

        cy.apiInitSetup().then(({team, user}) => {
            admin = user;
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Create team before installing demo plugin
            cy.apiCreateTeam('team', 'Team').then(({team: anotherTeam}) => {
                newTeam = anotherTeam;
            });

            // # Uninstall all plugins
            cy.apiGetAllPlugins().then(({plugins}) => {
                const {active, inactive} = plugins;
                inactive.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
                active.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
            });

            // # Install demo plugin
            cy.apiUploadPlugin(pluginName).then(() => {
                cy.apiEnablePluginById(pluginId);
            });

            // # Enable webhook events
            cy.postMessage('/demo_plugin true');
            cy.wait(TIMEOUTS.TWO_SEC);

            // * Verify that hooks are enabled
            cy.getLastPost().contains('enabled', {matchCase: false});

            // # Create channel
            cy.apiCreateChannel(team.id, 'my_test_channel', 'my_test_channel').then(({channel}) => {
                testChannel = channel.name;
            });

            // # Join the demo channel
            cy.visit(`/${testTeam.name}/channels/demo_plugin`);

            // # Create another user
            cy.apiCreateUser().then(({user: otherUser}) => {
                testUser = otherUser;
                cy.apiAddUserToTeam(team.id, testUser.id);

                // # Login another user
                cy.apiLogin(testUser);

                // # Join the demo channel
                cy.visit(`/${testTeam.name}/channels/demo_plugin`);
            });
        });
    });

    it('MM-T2408/2 - User posts a message Webhook event', () => {
        // # Post message
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.postMessage('some message');

        // * Verify message is posted in the demo channel
        cy.visit(`/${testTeam.name}/channels/demo_plugin`);
        cy.findAllByTestId('postView').contains(`MessageHasBeenPosted: @${testUser.username}, ~Town Square`);
    });

    it('MM-T2408/3 - User joined a channel Webhook event', () => {
        // # Join channel
        cy.visit(`/${testTeam.name}/channels/${testChannel}`);
        cy.wait(TIMEOUTS.TWO_SEC);

        // * Verify message is posted in the demo channel
        cy.visit(`/${testTeam.name}/channels/demo_plugin`);
        cy.findAllByTestId('postView').contains(`UserHasJoinedChannel: @${testUser.username}, ~my_test_channel`);
    });

    it('MM-T2408/4 - ​User left a channel Webhook event', () => {
        // # Leave channel
        cy.visit(`/${testTeam.name}/channels/${testChannel}`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.uiLeaveChannel(false);

        // * Verify message is posted in the demo plugin channel
        cy.visit(`/${testTeam.name}/channels/demo_plugin`);
        cy.findAllByTestId('postView').contains(`UserHasLeftChannel: @${testUser.username}, ~my_test_channel`);
    });

    it('MM-T2408/5/6 - User edited a message Webhook event', () => {
        // # Post message
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.postMessage('some message');

        // # Get last post ID
        cy.getLastPostId().then((postID) => {
            // # click  dot menu button
            cy.clickPostDotMenu();

            // # click edit post
            cy.get(`#edit_post_${postID}`).click();

            // # Edit message to 'some message add'
            cy.get('#edit_textbox').
                should('be.visible').
                and('be.focused').
                wait(TIMEOUTS.HALF_SEC).
                type(' add');

            // # Click button Edit
            cy.get('#editButton').click();

            // # Open demo plugin channel
            cy.visit(`/${testTeam.name}/channels/demo_plugin`);
            cy.wait(TIMEOUTS.TWO_SEC);

            // * Verify event posted in the channel
            cy.findAllByTestId('postView').contains(`MessageHasBeenUpdated: @${testUser.username}, ~Town Square`);
        });
    });

    it('MM-T2408/7 - User adds a reaction to a message Webhook event', () => {
        // # Post message
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.postMessage('some message');

        cy.getLastPostId().then((postId) => {
            // # Click the add reaction icon
            cy.clickPostReactionIcon(postId);

            // # Choose "slightly_frowning_face" emoji
            // delaying 500ms in case of lag
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.get('.emoji-picker__items #emoji-1f641').wait(500).click();

            // # Open demo plugin channel
            cy.visit(`/${testTeam.name}/channels/demo_plugin`);
            cy.wait(TIMEOUTS.TWO_SEC);

            // * Verify event posted in the channel
            cy.findAllByTestId('postView').contains(`ReactionHasBeenAdded: @${testUser.username}, `);
            cy.findAllByTestId('postView').contains(':slightly_frowning_face:');
        });
    });

    it('MM-T2408/8/9 - ​User joined the team Webhook event', () => {
        // # Add user to the team
        cy.apiAdminLogin(admin);
        cy.apiAddUserToTeam(newTeam.id, testUser.id);

        // # Open demo plugin channel
        cy.visit(`/${newTeam.name}/channels/demo_plugin`);
        cy.wait(TIMEOUTS.TWO_SEC);

        // * Verify event is posted in the channel
        cy.findAllByTestId('postView').contains(`UserHasJoinedTeam: @${testUser.username}`);

        // # Delete user from team
        cy.apiDeleteUserFromTeam(newTeam.id, testUser.id);

        // # Open demo plugin channel
        cy.visit(`/${newTeam.name}/channels/demo_plugin`);
        cy.wait(TIMEOUTS.TWO_SEC);

        // * Verify event is posted in the channel
        cy.findAllByTestId('postView').contains(`UserHasLeftTeam: @${testUser.username}`);
    });

    it('MM-T2408/10 - ​User user login Webhook event', () => {
        // # Login
        cy.apiLogin(testUser);

        // # Open demo plugin channel
        cy.visit(`/${testTeam.name}/channels/demo_plugin`);
        cy.wait(TIMEOUTS.TWO_SEC);

        // * Verify event is posted in the channel
        cy.findAllByTestId('postView').contains(`User @${testUser.username} has logged in`);
    });

    it('MM-T2408/11 - ​User user created Webhook event', () => {
        // # Login
        cy.apiAdminLogin(admin);

        // # Create another user
        cy.apiCreateUser().then(({user: otherUser}) => {
            // # Open demo plugin channel
            cy.visit(`/${testTeam.name}/channels/demo_plugin`);
            cy.wait(TIMEOUTS.TEN_SEC);

            // * Verify event is posted in the channel
            cy.findAllByTestId('postView').contains(`User_ID @${otherUser.id} has been created in`);
        });
    });
});
