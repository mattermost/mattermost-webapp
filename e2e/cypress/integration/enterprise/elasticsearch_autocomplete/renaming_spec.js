// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @elasticsearch @autocomplete

import {
    createEmail,
    enableElasticSearch,
    searchAndVerifyChannel,
    searchAndVerifyUser,
    withTimestamp,
} from './helpers';

describe('Autocomplete with Elasticsearch - Renaming', () => {
    const timestamp = Date.now();
    let team;

    before(() => {
        // # Login as admin
        cy.apiLogin('sysadmin');
        cy.apiSaveTeammateNameDisplayPreference('username');

        // * Check if server has license for Elasticsearch
        cy.requireLicenseForFeature('Elasticsearch');

        // # Create new team for tests
        cy.apiCreateTeam(`elastic-${timestamp}`, `elastic-${timestamp}`).then((response) => {
            team = response.body;
        });

        // # Enable elastic search
        enableElasticSearch();
    });

    it('renamed user appears in message input box', () => {
        const spiderman = {
            username: withTimestamp('spiderman', timestamp),
            firstName: 'Peter',
            lastName: 'Parker',
            email: createEmail('spiderman', timestamp),
            nickname: withTimestamp('friendlyneighborhood', timestamp),
        };

        // # Create a new user
        cy.apiCreateNewUser(spiderman, [team.id]).then((userResponse) => {
            const user = userResponse;
            cy.visit(`/${team.name}`);

            // # Verify user appears in search results pre-change
            searchAndVerifyUser(user);

            // # Rename a user
            const newName = withTimestamp('webslinger', timestamp);
            cy.apiPatchUser(user.id, {username: newName}).then(() => {
                user.username = newName;

                // # Verify user appears in search results post-change
                searchAndVerifyUser(user);
            });
        });
    });

    it('renamed channel appears in channel switcher', () => {
        const channelName = 'newchannel' + Date.now();
        const newChannelName = 'updatedchannel' + Date.now();

        // # Create a new channel
        cy.apiCreateChannel(team.id, channelName, channelName).then((channelResponse) => {
            const channel = channelResponse.body;

            // # Channel should appear in search results pre-change
            searchAndVerifyChannel(channel);

            // # Change the channels name
            cy.apiPatchChannel(channel.id, {name: newChannelName});
            channel.name = newChannelName;

            cy.reload();

            // # Search for channel and verify it appears
            searchAndVerifyChannel(channel);
        });
    });

    describe('renamed team', () => {
        let user;
        let channel;

        before(() => {
            const punisher = {
                username: withTimestamp('punisher', timestamp),
                firstName: 'Frank',
                lastName: 'Castle',
                email: createEmail('punisher', timestamp),
                nickname: withTimestamp('lockednloaded', timestamp),
            };

            // # Setup new channel and user
            cy.apiCreateNewUser(punisher, [team.id]).then((userResponse) => {
                user = userResponse;

                // # Hit escape to close and lingering modals
                cy.get('body').type('{esc}');

                // # Verify user appears in search results pre-change
                searchAndVerifyUser(user);
            });

            const channelName = 'another-channel' + Date.now();

            // # Create a new channel
            cy.apiCreateChannel(team.id, channelName, channelName).then((channelResponse) => {
                channel = channelResponse.body;

                // # Channel should appear in search results pre-change
                searchAndVerifyChannel(channel);

                // # Hit escape to close the modal
                cy.get('body').type('{esc}');
            });

            // # Rename the channel
            cy.apiPatchTeam(team.id, {name: 'updatedteam' + timestamp});
        });

        it('correctly searches for user', () => {
            cy.get('body').type('{esc}');
            searchAndVerifyUser(user);
        });

        it('correctly searches for channel', () => {
            cy.get('body').type('{esc}');
            searchAndVerifyChannel(channel);
        });
    });
});
