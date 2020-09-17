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

        /**
         * Create a new channel.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels/post
         * @param {String} teamId - Unique handler for a team, will be present in the team URL
         * @param {String} name - Unique handler for a channel, will be present in the team URL
         * @param {String} displayName - Non-unique UI name for the channel
         * @param {String} type - 'O' for a public channel (default), 'P' for a private channel
         * @param {String} purpose - A short description of the purpose of the channel
         * @param {String} header - Markdown-formatted text to display in the header of the channel
         * @param {Boolean} unique - if true (default), it will create with unique/random channel name.
         * @returns {Channel} `out.channel` as `Channel`
         *
         * @example
         *   cy.apiCreateChannel('team-id', 'test-channel', 'Test Channel').then(({channel}) => {
         *       // do something with channel
         *   });
         */
        apiCreateChannel(
            teamId: string,
            name: string,
            displayName: string,
            type?: string,
            purpose?: string,
            header?: string
        ): Chainable<Channel>;

        /**
         * Create a new direct message channel between two users.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1direct/post
         * @param {string[]} userIds - The two user ids to be in the direct message
         * @returns {Channel} `out.channel` as `Channel`
         *
         * @example
         *   cy.apiCreateDirectChannel('user-1-id', 'user-2-id').then(({channel}) => {
         *       // do something with channel
         *   });
         */
        apiCreateDirectChannel(userIds: Array<string>): Chainable<Channel>;

        /**
         * Create a new group message channel to group of users via API. If the logged in user's id is not included in the list, it will be appended to the end.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1group/post
         * @param {string[]} userIds - User ids to be in the group message channel
         * @returns {Channel} `out.channel` as `Channel`
         *
         * @example
         *   cy.apiCreateGroupChannel('user-1-id', 'user-2-id', 'current-user-id').then(({channel}) => {
         *       // do something with channel
         *   });
         */
        apiCreateGroupChannel(userIds: Array<string>): Chainable<Channel>;

        /**
         * Updates channel's privacy allowing changing a channel from Public to Private and back.
         * See https://api.mattermost.com/#tag/channels/paths/~1channels~1{channel_id}~1privacy/put
         * @param {string} channelId - The channel ID to be patched
         * @param {string} privacy - The privacy the channel should be set too. P = Private, O = Open
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         * @returns {Channel} response.body: `Channel` object
         *
         * @example
         *   cy.apiPatchChannelPrivacy('channel-id', 'P');
         */
        apiPatchChannelPrivacy(channelId: string, privacy: string): Chainable<Response>;
    }
}
