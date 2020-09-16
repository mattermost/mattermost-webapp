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
    interface Chainable<Subject = any> {

        // *******************************************************************************
        // Channels
        // https://api.mattermost.com/#tag/channels
        // *******************************************************************************

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
    }
}
