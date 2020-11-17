// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

// ***************************************************************
// Each command should be properly documented using JSDoc.
// See https://jsdoc.app/index.html for reference.
// Basic requirements for documentation are the following:
// - Meaningful description
// - Each parameter with `@params`
// - Return value with `@returns`
// - Example usage with `@example`
// Custom command should follow naming convention of having `api` prefix, e.g. `apiLogin`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * Creates a new user and make it a member of the new public team and its channels - one public channel, town-square and off-topic.
         * Created user has an option to log in after all are setup.
         * Requires sysadmin session to initiate this command.
         * @param {boolean} options.loginAfter - false (default) or true if wants to login as the new user after setting up. Note that when true, succeeding API request will be limited to access/permission of a regular system user.
         * @param {string} options.userPrefix - 'user' (default) or any prefix to easily identify a user
         * @param {string} options.teamPrefix - {name: 'team', displayName: 'Team'} (default) or any prefix to easily identify a team
         * @param {string} options.channelPrefix - {name: 'team', displayName: 'Team'} (default) or any prefix to easily identify a channel
         * @returns {Object} `out` Cypress-chainable, yielded with element passed into .wrap().
         * @returns {UserProfile} `out.user` as `UserProfile` object
         * @returns {Team} `out.team` as `Team` object
         * @returns {Channel} `out.channel` as `Channel` object
         *
         * @example
         *   let testUser;
         *   let testTeam;
         *   let testChannel;
         *   cy.apiInitSetup(options).then(({team, channel, user}) => {
         *       testUser = user;
         *       testTeam = team;
         *       testChannel = channel;
         *   });
         */
        apiInitSetup(options: Record<string, any>): Chainable<Record<string, any>>;
    }
}
