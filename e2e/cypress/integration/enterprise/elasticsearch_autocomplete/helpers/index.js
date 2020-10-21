// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {getAdminAccount} from '../../../../support/env';

const admin = getAdminAccount();

function withTimestamp(string, timestamp) {
    return string + '-' + timestamp;
}

function createEmail(name, timestamp) {
    return name + timestamp + '@sample.mattermost.com';
}

module.exports = {
    withTimestamp,
    createEmail,
    enableElasticSearch: () => {
        // Enable elastic search via the API
        cy.apiUpdateConfig({
            ElasticsearchSettings: {
                EnableAutocomplete: true,
                EnableIndexing: true,
                EnableSearching: true,
                Sniff: false,
            },
        });

        // Navigate to the elastic search setting page
        cy.visit('/admin_console/environment/elasticsearch');

        // Test the connection and verify that we are successful
        cy.contains('button', 'Test Connection').click();
        cy.get('.alert-success').should('have.text', 'Test successful. Configuration saved.');

        // Index so we are up to date
        cy.contains('button', 'Index Now').click();

        // Small wait to ensure new row is added
        cy.wait(TIMEOUTS.HALF_SEC);

        cy.get('.job-table__table').find('tbody > tr').eq(0).as('firstRow').find('.status-icon-warning', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible');

        // Newest row should eventually result in Success
        cy.waitUntil(() => {
            return cy.get('@firstRow').then((el) => {
                return el.find('.status-icon-success').length > 0;
            });
        }
        , {
            timeout: TIMEOUTS.FIVE_MIN,
            interval: TIMEOUTS.TWO_SEC,
            errorMsg: 'Reindex did not succeed in time',
        });
    },
    getTestUsers: () => {
        // Reverse the timestamp so that on search,
        // the newly created user will get on the list first.
        const reverseTimeStamp = (20 * Math.pow(10, 13)) - Date.now();
        return {
            ironman: {
                username: withTimestamp('ironman', reverseTimeStamp),
                password: 'passwd',
                first_name: 'Tony',
                last_name: 'Stark',
                email: createEmail('ironman', reverseTimeStamp),
                nickname: withTimestamp('protoncannon', reverseTimeStamp),
            },
            hulk: {
                username: withTimestamp('hulk', reverseTimeStamp),
                password: 'passwd',
                first_name: 'Bruce',
                last_name: 'Banner',
                email: createEmail('hulk', reverseTimeStamp),
                nickname: withTimestamp('gammaray', reverseTimeStamp),
            },
            hawkeye: {
                username: withTimestamp('hawkeye', reverseTimeStamp),
                password: 'passwd',
                first_name: 'Clint',
                last_name: 'Barton',
                email: createEmail('hawkeye', reverseTimeStamp),
                nickname: withTimestamp('ronin', reverseTimeStamp),
            },
            deadpool: {
                username: withTimestamp('deadpool', reverseTimeStamp),
                password: 'passwd',
                first_name: 'Wade',
                last_name: 'Wilson',
                email: createEmail('deadpool', reverseTimeStamp),
                nickname: withTimestamp('merc', reverseTimeStamp),
            },
            captainamerica: {
                username: withTimestamp('captainamerica', reverseTimeStamp),
                password: 'passwd',
                first_name: 'Steve',
                last_name: 'Rogers',
                email: createEmail('captainamerica', reverseTimeStamp),
                nickname: withTimestamp('professional', reverseTimeStamp),
            },
            doctorstrange: {
                username: withTimestamp('doctorstrange', reverseTimeStamp),
                password: 'passwd',
                first_name: 'Stephen',
                last_name: 'Strange',
                email: createEmail('doctorstrange', reverseTimeStamp),
                nickname: withTimestamp('sorcerersupreme', reverseTimeStamp),
            },
            thor: {
                username: withTimestamp('thor', reverseTimeStamp),
                password: 'passwd',
                first_name: 'Thor',
                last_name: 'Odinson',
                email: createEmail('thor', reverseTimeStamp),
                nickname: withTimestamp('mjolnir', reverseTimeStamp),
            },
            loki: {
                username: withTimestamp('loki', reverseTimeStamp),
                password: 'passwd',
                first_name: 'Loki',
                last_name: 'Odinson',
                email: createEmail('loki', reverseTimeStamp),
                nickname: withTimestamp('trickster', reverseTimeStamp),
            },
            dot: {
                username: withTimestamp('dot.dot', reverseTimeStamp),
                password: 'passwd',
                first_name: 'z1First',
                last_name: 'z1Last',
                email: createEmail('dot', reverseTimeStamp),
                nickname: 'z1Nick',
            },
            dash: {
                username: withTimestamp('dash-dash', reverseTimeStamp),
                password: 'passwd',
                first_name: 'z2First',
                last_name: 'z2Last',
                email: createEmail('dash', reverseTimeStamp),
                nickname: 'z2Nick',
            },
            underscore: {
                username: withTimestamp('under_score', reverseTimeStamp),
                password: 'passwd',
                first_name: 'z3First',
                last_name: 'z3Last',
                email: createEmail('undercore', reverseTimeStamp),
                nickname: 'z3Nick',
            },
        };
    },
    createPrivateChannel: (teamId, userToAdd = null) => {
        const baseUrl = Cypress.config('baseUrl');

        // As the sysadmin, create a private channel
        return cy.task('externalRequest', {
            user: admin,
            method: 'post',
            baseUrl,
            path: 'channels',
            data: {
                team_id: teamId,
                name: 'private' + Date.now(),
                display_name: 'private' + Date.now(),
                type: 'P',
                header: '',
                purpose: '',
            },
        }).then((privateResponse) => {
            expect(privateResponse.status).to.equal(201);
            const channel = privateResponse.data;

            // If we have a user to add to the team, add them now
            if (userToAdd) {
                // First get the user details by email of the user
                return cy.apiGetUserByEmail(userToAdd.email).then(({user}) => {
                    // Add user to team
                    cy.task('externalRequest', {
                        user: admin,
                        method: 'post',
                        baseUrl,
                        path: `channels/${channel.id}/members`,
                        data: {
                            user_id: user.id,
                        },
                    }).then((addResponse) => {
                        expect(addResponse.status).to.equal(201);

                        // explicitly wait to give some to index before searching
                        cy.wait(TIMEOUTS.TWO_SEC);
                        return cy.wrap(channel);
                    });
                });
            }

            // explicitly wait to give some to index before searching
            cy.wait(TIMEOUTS.TWO_SEC);
            return cy.wrap(channel);
        });
    },
    searchForChannel: (name) => {
        // Open up channel switcher
        cy.typeCmdOrCtrl().type('k');

        // Clear out and type in the name
        cy.get('#quickSwitchInput').
            should('be.visible').
            as('input').
            clear().
            type(name);
    },
    searchAndVerifyChannel: (channel) => {
        // # Type cmd-K to open channel switcher
        cy.typeCmdOrCtrl().type('k');

        // # Search for channel's display name
        cy.get('#quickSwitchInput').
            should('be.visible').
            as('input').
            clear().
            type(channel.display_name);

        // * Suggestions should appear
        cy.get('#suggestionList', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible');

        // * Channel should appear
        cy.findByTestId(channel.name).
            should('be.visible');
    },
    searchAndVerifyUser: (user) => {
        // # Start @ mentions autocomplete with username
        cy.get('#post_textbox').
            as('input').
            should('be.visible').
            clear().
            type(`@${user.username}`);

        // * Suggestion list should appear
        cy.get('#suggestionList', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible');

        // # Verify user appears in results post-change
        return cy.findByTestId(`mentionSuggestion_${user.username}`, {exact: false}).within((name) => {
            cy.wrap(name).find('.mention--align').should('have.text', `@${user.username}`);
            cy.wrap(name).find('.ml-2').should('have.text', `${user.first_name} ${user.last_name} (${user.nickname})`);
        });
    },
};
