// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getAdminAccount} from '../../support/env';

export {
    createPrivateChannel,
    createPublicChannel,
    createSearchData,
    enableElasticSearch,
    getTestUsers,
    getPostTextboxInput,
    getQuickChannelSwitcherInput,
    searchAndVerifyChannel,
    searchAndVerifyUser,
    searchForChannel,
    startAtMention,
    verifySuggestionAtChannelSwitcher,
    verifySuggestionAtPostTextbox,
};

function createPrivateChannel(teamId, userToAdd = null) {
    // # Create a private channel as sysadmin
    return createChannel('P', teamId, userToAdd);
}

function createPublicChannel(teamId, userToAdd = null) {
    // # Create a public channel as sysadmin
    return createChannel('O', teamId, userToAdd);
}

function createSearchData(prefix) {
    return cy.apiCreateCustomAdmin().then(({sysadmin}) => {
        const users = getTestUsers(prefix);

        cy.apiLogin(sysadmin);

        // # Create new team for tests
        return cy.apiCreateTeam('search', 'Search').then(({team}) => {
            // # Create pool of users for tests
            Cypress._.forEach(users, (testUser) => {
                cy.apiCreateUser({user: testUser}).then(({user}) => {
                    cy.apiAddUserToTeam(team.id, user.id);
                });
            });

            return cy.wrap({sysadmin, team, users});
        });
    });
}

function enableElasticSearch() {
    // # Enable elastic search via the API
    cy.apiUpdateConfig({
        ElasticsearchSettings: {
            EnableAutocomplete: true,
            EnableIndexing: true,
            EnableSearching: true,
            Sniff: false,
        },
    });

    // # Navigate to the elastic search setting page
    cy.visit('/admin_console/environment/elasticsearch');

    // * Test the connection and verify that we are successful
    cy.contains('button', 'Test Connection').click();
    cy.get('.alert-success').should('have.text', 'Test successful. Configuration saved.');

    // # Index so we are up to date
    cy.contains('button', 'Index Now').click();

    // # Small wait to ensure new row is added
    cy.wait(TIMEOUTS.ONE_SEC).get('.job-table__table').find('tbody > tr').eq(0).as('firstRow');

    // * Newest row should eventually result in Success
    const checkFirstRow = () => {
        return cy.get('@firstRow').then((el) => {
            return el.find('.status-icon-success').length > 0;
        });
    };
    const options = {
        timeout: TIMEOUTS.TWO_MIN,
        interval: TIMEOUTS.TWO_SEC,
        errorMsg: 'Reindex did not succeed in time',
    };
    cy.waitUntil(checkFirstRow, options);
}

function getTestUsers(prefix = '') {
    if (Cypress.env('searchTestUsers')) {
        return JSON.parse(Cypress.env('searchTestUsers'));
    }

    return {
        ironman: generatePrefixedUser({
            username: 'ironman',
            firstName: 'Tony',
            lastName: 'Stark',
            nickname: 'protoncannon',
        }, prefix),
        hulk: generatePrefixedUser({
            username: 'hulk',
            firstName: 'Bruce',
            lastName: 'Banner',
            nickname: 'gammaray',
        }, prefix),
        hawkeye: generatePrefixedUser({
            username: 'hawkeye',
            firstName: 'Clint',
            lastName: 'Barton',
            nickname: 'ronin',
        }, prefix),
        deadpool: generatePrefixedUser({
            username: 'deadpool',
            firstName: 'Wade',
            lastName: 'Wilson',
            nickname: 'merc',
        }, prefix),
        captainamerica: generatePrefixedUser({
            username: 'captainamerica',
            firstName: 'Steve',
            lastName: 'Rogers',
            nickname: 'professional',
        }, prefix),
        doctorstrange: generatePrefixedUser({
            username: 'doctorstrange',
            firstName: 'Stephen',
            lastName: 'Strange',
            nickname: 'sorcerersupreme',
        }, prefix),
        thor: generatePrefixedUser({
            username: 'thor',
            firstName: 'Thor',
            lastName: 'Odinson',
            nickname: 'mjolnir',
        }, prefix),
        loki: generatePrefixedUser({
            username: 'loki',
            firstName: 'Loki',
            lastName: 'Odinson',
            nickname: 'trickster',
        }, prefix),
        dot: generatePrefixedUser({
            username: 'dot.dot',
            firstName: 'z1First',
            lastName: 'z1Last',
            nickname: 'z1Nick',
        }, prefix),
        dash: generatePrefixedUser({
            username: 'dash-dash',
            firstName: 'z2First',
            lastName: 'z2Last',
            nickname: 'z2Nick',
        }, prefix),
        underscore: generatePrefixedUser({
            username: 'under_score',
            firstName: 'z3First',
            lastName: 'z3Last',
            nickname: 'z3Nick',
        }, prefix),
    };
}

function getPostTextboxInput() {
    cy.wait(TIMEOUTS.HALF_SEC);
    cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).
        as('input').
        should('be.visible').
        clear();
}

function getQuickChannelSwitcherInput() {
    cy.findByRole('textbox', {name: 'quick switch input'}).
        should('be.visible').
        as('input').
        clear();
}

function searchAndVerifyChannel(channel, shouldExist = true) {
    const name = channel.display_name;
    searchForChannel(name);

    if (shouldExist) {
        // * Channel should appear in suggestions list
        cy.get('#suggestionList').findByTestId(channel.name).should('be.visible');
    } else {
        // * Suggestion list and channel item should not appear
        cy.get('#suggestionList').should('not.exist');
        cy.findByTestId(channel.name).should('not.exist');
    }
}

function searchAndVerifyUser(user) {
    // # Start @ mentions autocomplete with username
    cy.get('#post_textbox').
        as('input').
        should('be.visible').
        clear().
        type(`@${user.username}`);

    // * Suggestion list should appear
    cy.get('#suggestionList', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible');

    // * Verify user appears in results post-change
    return cy.uiVerifyAtMentionSuggestion(user);
}

function searchForChannel(name) {
    // # Open up channel switcher
    cy.typeCmdOrCtrl().type('k').wait(TIMEOUTS.ONE_SEC);

    // # Clear out and type in the name
    cy.findByRole('textbox', {name: 'quick switch input'}).
        should('be.visible').
        as('input').
        clear().
        type(name);
}

function startAtMention(string) {
    // # Get the expected input
    cy.get('@input').clear().type(string);

    // * Suggestion list should appear
    cy.get('#suggestionList').should('be.visible');
}

function verifySuggestionAtPostTextbox(...expectedUsers) {
    expectedUsers.forEach((user) => {
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.uiVerifyAtMentionSuggestion(user);
    });
}

function verifySuggestionAtChannelSwitcher(...expectedUsers) {
    expectedUsers.forEach((user) => {
        cy.findByTestId(user.username).
            should('be.visible').
            and('have.text', `${user.first_name} ${user.last_name} (${user.nickname})@${user.username}`);
    });
}

function createChannel(channelType, teamId, userToAdd = null) {
    // # Create a channel as sysadmin
    return cy.externalRequest({
        user: getAdminAccount(),
        method: 'POST',
        path: 'channels',
        data: {
            team_id: teamId,
            name: 'test-channel' + Date.now(),
            display_name: 'Test Channel ' + Date.now(),
            type: channelType,
            header: '',
            purpose: '',
        },
    }).then(({data: channel}) => {
        if (userToAdd) {
            // # Get user profile by email
            return cy.apiGetUserByEmail(userToAdd.email).then(({user}) => {
                // # Add user to team
                cy.externalRequest({
                    user: getAdminAccount(),
                    method: 'post',
                    path: `channels/${channel.id}/members`,
                    data: {user_id: user.id},
                }).then(() => {
                    // # Explicitly wait to give some time to index before searching
                    cy.wait(TIMEOUTS.TWO_SEC);
                    return cy.wrap(channel);
                });
            });
        }

        // # Explicitly wait to give some time to index before searching
        cy.wait(TIMEOUTS.TWO_SEC);
        return cy.wrap(channel);
    });
}

function generatePrefixedUser(user = {}, prefix) {
    return {
        username: withPrefix(user.username, prefix),
        password: 'passwd',
        first_name: withPrefix(user.firstName, prefix),
        last_name: withPrefix(user.lastName, prefix),
        email: createEmail(user.username, prefix),
        nickname: withPrefix(user.nickname, prefix),
    };
}

function withPrefix(name, prefix) {
    return prefix + name;
}

function createEmail(name, prefix) {
    return `${prefix}${name}@sample.mattermost.com`;
}
