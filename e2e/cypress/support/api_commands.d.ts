// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

// ***************************************************************
// Each command should be properly documented using JSDoc.
// See https://jsdoc.app/index.html for reference.
// Basic requirements for documentation are the following:
// - Meaningful description
// - Specific link to https://api.mattermost.com
// - Each parameter with `@params`
// - Return value with `@returns`
// - Example usage with `@example`
// Custom command should follow naming convention of having `api` prefix, e.g. `apiLogin`.
// ***************************************************************

declare namespace Cypress {
    type Bot = import('mattermost-redux/types/bots').Bot;
    type Channel = import('mattermost-redux/types/channels').Channel;
    type ChannelMembership = import('mattermost-redux/types/channels').ChannelMembership;
    type ChannelType = import('mattermost-redux/types/channels').ChannelType;
    type UserProfile = import('mattermost-redux/types/users').UserProfile;

    interface Chainable<Subject = any> {

        // *******************************************************************************
        // Bots
        // https://api.mattermost.com/#tag/bots
        // *******************************************************************************

        /**
         * Get a page of a list of bots via API.
         * See https://api.mattermost.com/#tag/bots/paths/~1bots/get
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         * @returns {Bot} response.body: `Bot` object
         *
         * @example
         *   cy.apiGetBots().then((response) => {
         *       const bots = response.body;
         *   });
         */
        apiGetBots(): Chainable<Response>;

        // *******************************************************************************
        // Channels
        // https://api.mattermost.com/#tag/channels
        // *******************************************************************************

        /**
         * Create a new direct message channel between two users via API.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1direct/post
         * @param {string} teamId - The team ID of the team to create the channel on
         * @param {string} name - The unique handle for the channel, will be present in the channel URL
         * @param {string} displayName - The non-unique UI name for the channel
         * @param {ChannelType} type - 'O' for a public channel (default), 'P' for a private channel
         * @param {string} purpose - A short description of the purpose of the channel
         * @param {string} header - Markdown-formatted text to display in the header of the channel
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 201 CREATED to continue or pass.
         * @returns {Channel} response.body: `Channel` object
         *
         * @example
         *   cy.apiCreateChannel('team-id', 'channel-name', 'channel-display-name').then((response) => {
         *     const newChannel = response.body;
         *   });
         */
        apiCreateChannel(
            teamId: string,
            name: string,
            displayName: string,
            type: ChannelType,
            purpose?: string,
            header?: string
        ): Chainable<Response>;

        /**
         * Create a new direct message channel between two users.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1direct/post
         * @param {string[]} userIds - The two user ids to be in the direct message
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 201 CREATED to continue or pass.
         * @returns {Channel} response.body: `Channel` object
         *
         * @example
         *   cy.apiCreateDirectChannel('user-1-id', 'user-2-id').then((response) => {
         *     const newDMChannel = response.body;
         *   });
         */
        apiCreateDirectChannel(userIds: Array<string>): Chainable<Response>;

        /**
         * Create a new group message channel to group of users via API. If the logged in user's id is not included in the list, it will be appended to the end.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1group/post
         * @param {string[]} userIds - User ids to be in the group message channel
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 201 CREATED to continue or pass.
         * @returns {Channel} response.body: `Channel` object
         *
         * @example
         *   cy.apiCreateGroupChannel('user-1-id', 'user-2-id', 'current-user-id').then((response) => {
         *     const newGroupChannel = response.body;
         *   });
         */
        apiCreateGroupChannel(userIds: Array<string>): Chainable<Response>;

        /**
         * Soft deletes a channel, by marking the channel as deleted in the database.
         * Soft deleted channels will not be accessible in the user interface.
         * Direct and group message channels cannot be deleted.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1{channel_id}/delete
         * @param {string} channelId - The channel ID to be deleted
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         *
         * @example
         *   cy.apiDeleteChannel('channel-id');
         */
        apiDeleteChannel(channelId: string): Chainable<Response>;

        /**
         * Update a channel.
         * The fields that can be updated are listed as parameters. Omitted fields will be treated as blanks.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1{channel_id}/put
         * @param {string} channelId - The channel ID to be updated
         * @param {Channel} channel - Channel object to be updated
         * @param {string} channel.name - The unique handle for the channel, will be present in the channel URL
         * @param {string} channel.display_name - The non-unique UI name for the channel
         * @param {string} channel.purpose - A short description of the purpose of the channel
         * @param {string} channel.header - Markdown-formatted text to display in the header of the channel
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         * @returns {Channel} response.body: `Channel` object
         *
         * @example
         *   cy.apiUpdateChannel('channel-id', {name: 'new-name', display_name: 'New Display Name'. 'purpose': 'Updated purpose', 'header': 'Updated header'});
         */
        apiUpdateChannel(channelId: string, channel: Channel): Chainable<Response>;

        /**
         * Partially update a channel by providing only the fields you want to update.
         * Omitted fields will not be updated.
         * The fields that can be updated are defined in the request body, all other provided fields will be ignored.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1{channel_id}~1patch/put
         * @param {string} channelId - The channel ID to be patched
         * @param {Channel} channel - Channel object to be patched
         * @param {string} channel.name - The unique handle for the channel, will be present in the channel URL
         * @param {string} channel.display_name - The non-unique UI name for the channel
         * @param {string} channel.purpose - A short description of the purpose of the channel
         * @param {string} channel.header - Markdown-formatted text to display in the header of the channel
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         * @returns {Channel} response.body: `Channel` object
         *
         * @example
         *   cy.apiPatchChannel('channel-id', {name: 'new-name', display_name: 'New Display Name'});
         */
        apiPatchChannel(channelId: string, channel: Channel): Chainable<Response>;

        /**
         * Gets a channel from the provided team name and channel name strings.
         * See https://api.mattermost.com/#tag/channels/paths/~1teams~1name~1{team_name}~1channels~1name~1{channel_name}/get
         * @param {string} teamName - Team name
         * @param {string} channelName - Channel name
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         * @returns {Channel} response.body: `Channel` object
         *
         * @example
         *   cy.apiGetChannelByName('team-name', 'channel-name').then((response) => {
         *     const channel = response.body;
         *   });
         */
        apiGetChannelByName(teamName: string, channelName: string): Chainable<Response>;

        /**
         * Get channel from the provided channel id string.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1{channel_id}/get
         * @param {string} channelId - Channel ID
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         * @returns {Channel} response.body: `Channel` object
         *
         * @example
         *   cy.apiGetChannel('channel-id').then((response) => {
         *     const channel = response.body;
         *   });
         */
        apiGetChannel(channelId: string): Chainable<Response>;

        /**
         * Add a user to a channel by creating a channel member object.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1{channel_id}~1members/post
         * @param {string} channelId - Channel ID
         * @param {string} userId - User ID to add to the channel
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         * @returns {ChannelMembership} response.body: `ChannelMembership` object
         *
         * @example
         *   cy.apiAddUserToChannel('channel-id', 'user-id').then((response) => {
         *     const channelMember = response.body;
         *   });
         */
        apiAddUserToChannel(channelId: string, userId: string): Chainable<Response>;

        // *******************************************************************************
        // Users
        // https://api.mattermost.com/#tag/users
        // *******************************************************************************

        /**
         * Login to server via API.
         * See https://api.mattermost.com/#tag/users/paths/~1users~1login/post
         * @param {string} username
         * @param {string} password
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         * @returns {UserProfile} response.body: `UserProfile` object
         *
         * @example
         *   cy.apiLogin('sysadmin');
         */
        apiLogin(username: string, password?: string): Chainable<Response>;

        /**
         * Logout a user's active session from server via API.
         * See https://api.mattermost.com/#tag/users/paths/~1users~1logout/post
         * Clears all cookies espececially `MMAUTHTOKEN`, `MMUSERID` and `MMCSRF`.
         *
         * @example
         *   cy.apiLogout();
         */
        apiLogout();
    }
}
