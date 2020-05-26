// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @autocomplete

import * as TIMEOUTS from '../../fixtures/timeouts';

import {withTimestamp, createEmail} from '../enterprise/elasticsearch_autocomplete/helpers';

function searchAndVerifyChannel(channel) {
    // # Type cmd-K to open channel switcher
    cy.typeCmdOrCtrl().type('k');

    // # Search for channel's display name
    cy.get('#quickSwitchInput').
        should('be.visible').
        as('input').
        clear().
        type(channel.display_name);

    // * Suggestions should appear
    cy.get('#suggestionList', {timeout: TIMEOUTS.SMALL}).should('be.visible');

    // * Channel should appear
    cy.findByTestId(channel.name).
        should('be.visible');
}

function searchAndVerifyUser(user) {
    // # Start @ mentions autocomplete with username
    cy.get('#post_textbox').
        as('input').
        should('be.visible').
        clear().
        type(`@${user.username}`);

    // * Suggestion list should appear
    cy.get('#suggestionList', {timeout: TIMEOUTS.SMALL}).should('be.visible');

    // # Verify user appears in results post-change
    return cy.findByTestId(`mentionSuggestion_${user.username}`, {exact: false}).within((name) => {
        cy.wrap(name).find('.mention--align').should('have.text', `@${user.username}`);
        cy.wrap(name).find('.ml-2').should('have.text', `${user.firstName} ${user.lastName} (${user.nickname})`);
    });
}

describe('Autocomplete without Elasticsearch - Renaming', () => {
    const timestamp = Date.now();
    let team;

    before(() => {
        // # Login as admin
        cy.apiLogin('sysadmin');
        cy.apiSaveTeammateNameDisplayPreference('username');

        // # Disable elastic search via API
        cy.apiUpdateConfig({
            ElasticsearchSettings: {
                EnableAutocomplete: false,
                EnableIndexing: false,
                EnableSearching: false,
                Sniff: false,
            },
        });

        // # Create new team for tests
        cy.apiCreateTeam(`search-${timestamp}`, `search-${timestamp}`).then((response) => {
            team = response.body;
        });
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
