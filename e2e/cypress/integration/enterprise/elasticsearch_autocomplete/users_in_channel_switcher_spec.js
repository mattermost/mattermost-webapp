// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @elasticsearch @autocomplete @not_cloud

import * as TIMEOUTS from '../../../fixtures/timeouts';

import {
    enableElasticSearch,
    getTestUsers,
    startAtMention,
} from './helpers';

describe('Autocomplete with Elasticsearch - Users', () => {
    const timestamp = Date.now();
    const testUsers = getTestUsers();
    let testTeam;

    before(() => {
        cy.shouldNotRunOnCloudEdition();

        // * Check if server has license for Elasticsearch
        cy.apiRequireLicenseForFeature('Elasticsearch');

        // # Enable Elasticsearch
        enableElasticSearch();

        // # Create new team for tests
        cy.apiCreateTeam(`elastic-${timestamp}`, `elastic-${timestamp}`).then(({team}) => {
            testTeam = team;

            // # Create pool of users for tests
            Cypress._.forEach(testUsers, (testUser) => {
                cy.apiCreateUser({user: testUser}).then(({user}) => {
                    cy.apiAddUserToTeam(testTeam.id, user.id);
                });
            });

            // # Navigate to the new teams town square
            cy.visit(`/${testTeam.name}/channels/town-square`);
            cy.typeCmdOrCtrl().type('k');
            cy.findByRole('textbox', {name: 'quick switch input'}).should('be.visible');
        });
    });

    describe('search for user in channel switcher', () => {
        describe('by @username', () => {
            it('MM-T2506_1 Full username returns single user', () => {
                getInput();
                startAtMention('@ironman');
                verifySuggestion(testUsers.ironman);
            });

            it('MM-T2506_2 Unique partial username returns single user', () => {
                getInput();
                startAtMention('@do');
                verifySuggestion(testUsers.doctorstrange);
            });

            it('MM-T2506_3 Partial username returns all users that match', () => {
                getInput();
                startAtMention('@i');
                verifySuggestion(testUsers.ironman);
            });
        });

        describe('by @firstname', () => {
            it('MM-T3860_1 Full first name returns single user', () => {
                getInput();
                startAtMention('@tony');
                verifySuggestion(testUsers.ironman);
            });

            it('MM-T3860_2 Unique partial first name returns single user', () => {
                getInput();
                startAtMention('@wa');
                verifySuggestion(testUsers.deadpool);
            });

            it('MM-T3860_3 Partial first name returns all users that match', () => {
                getInput();
                startAtMention('@ste');
                verifySuggestion(testUsers.captainamerica, testUsers.doctorstrange);
            });
        });

        describe('by @lastname', () => {
            it('MM-T3861_1 Full last name returns single user', () => {
                getInput();
                startAtMention('@stark');
                verifySuggestion(testUsers.ironman);
            });

            it('MM-T3861_2 Unique partial last name returns single user', () => {
                getInput();
                startAtMention('@ban');
                verifySuggestion(testUsers.hulk);
            });

            it('MM-T3861_3 Partial last name returns all users that match', () => {
                getInput();
                startAtMention('@ba');
                verifySuggestion(testUsers.hawkeye, testUsers.hulk);
            });
        });

        describe('by @nickname', () => {
            it('MM-T3862_1 Full nickname returns single user', () => {
                getInput();
                startAtMention('@ronin');
                verifySuggestion(testUsers.hawkeye);
            });

            it('MM-T3862_2 Unique partial nickname returns single user', () => {
                getInput();
                startAtMention('@gam');
                verifySuggestion(testUsers.hulk);
            });

            it('MM-T3862_3 Partial nickname returns all users that match', () => {
                getInput();
                startAtMention('@pro');
                verifySuggestion(testUsers.captainamerica, testUsers.ironman);
            });
        });

        describe('special characters in usernames are returned', () => {
            it('MM-T3856_1 Username with dot', () => {
                getInput();
                startAtMention('@dot.dot');
                verifySuggestion(testUsers.dot);
            });

            it('MM-T3856_2 Username dash', () => {
                getInput();
                startAtMention('@dash-dash');
                verifySuggestion(testUsers.dash);
            });

            it('MM-T3856_3 Username underscore', () => {
                getInput();
                startAtMention('@under_score');
                verifySuggestion(testUsers.underscore);
            });
        });
    });
});

function getInput() {
    cy.wait(TIMEOUTS.HALF_SEC);
    cy.findByRole('textbox', {name: 'quick switch input'}).
        should('be.visible').
        as('input').
        clear();
}

function verifySuggestion(...expectedUsers) {
    expectedUsers.forEach((user) => {
        cy.findByTestId(user.username).
            should('be.visible').
            and('have.text', `@${user.username} - ${user.first_name} ${user.last_name} (${user.nickname})`);
    });
}
