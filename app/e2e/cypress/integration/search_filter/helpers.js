// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getRandomId} from '../../utils';

export function searchAndValidate(query, expectedResults = []) {
    cy.reload();

    // # Enter in search query, and hit enter
    cy.get('#searchBox').clear().wait(TIMEOUTS.HALF_SEC).type(query).wait(TIMEOUTS.HALF_SEC).type('{enter}');

    cy.get('#loadingSpinner').should('not.be.visible');
    cy.get('#search-items-container', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

    // * Verify the amount of results matches the amount of our expected results
    cy.findAllByTestId('search-item-container').should('have.length', expectedResults.length).then((results) => {
        if (expectedResults.length > 0) {
            // * Verify text of each result
            cy.wrap(results).each((result, index) => {
                cy.wrap(result).find('.post-message').should('have.text', expectedResults[index]);
            });
        } else {
            // * If we expect no results, verify results message
            cy.get('.no-results__title').should('be.visible').and('have.text', `No results for "${query}"`);
        }
    });

    cy.get('#searchResultsCloseButton').click();
    cy.get('.search-item__container').should('not.exist');
}

export function getMsAndQueryForDate(date) {
    return {
        ms: date,
        query: new Date(date).toISOString().split('T')[0],
    };
}

export function getTestMessages() {
    const commonText = getRandomId();

    // Setup Messages
    const todayMessage = `1st Today's message ${commonText}`;
    const firstMessage = `5th First message ${commonText}`;
    const secondMessage = `3rd Second message ${commonText}`;
    const firstOffTopicMessage = `4th Off topic 1 ${commonText}`;
    const secondOffTopicMessage = `2nd Off topic 2 ${commonText}`;

    const allMessagesInOrder = [
        todayMessage,
        secondOffTopicMessage,
        secondMessage,
        firstOffTopicMessage,
        firstMessage,
    ];

    return {
        commonText,
        allMessagesInOrder,
        todayMessage,
        firstMessage,
        secondMessage,
        firstOffTopicMessage,
        secondOffTopicMessage,

        // Get dates for query and in ms for usage below
        firstDateEarly: getMsAndQueryForDate(Date.UTC(2018, 5, 5, 9, 30)), // June 5th, 2018 @ 9:30am
        firstDateLater: getMsAndQueryForDate(Date.UTC(2018, 5, 5, 9, 45)), // June 5th, 2018 @ 9:45am
        secondDateEarly: getMsAndQueryForDate(Date.UTC(2018, 9, 15, 13, 15)), // October 15th, 2018 @ 1:15pm
        secondDateLater: getMsAndQueryForDate(Date.UTC(2018, 9, 15, 13, 25)), // October 15th, 2018 @ 1:25pm
    };
}

export function setupTestData(data, {team, admin, anotherAdmin}) {
    const {
        todayMessage,
        firstMessage,
        secondMessage,
        firstOffTopicMessage,
        secondOffTopicMessage,
        firstDateEarly,
        secondDateEarly,
        firstDateLater,
        secondDateLater,
    } = data;

    // # Create another admin user so we can create override create_at of posts
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: admin, method: 'put', baseUrl, path: `users/${anotherAdmin.id}/roles`, data: {roles: 'system_user system_admin'}});

    // # Visit town-square
    cy.visit(`/${team.name}/channels/town-square`);

    // # Create a post from today
    cy.get('#postListContent', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible');
    cy.postMessage(todayMessage).wait(TIMEOUTS.ONE_SEC);

    cy.apiGetChannelByName(team.name, 'town-square').then(({channel: townSquareChannel}) => {
        // # Post message as new admin to Town Square
        cy.postMessageAs({sender: anotherAdmin, message: firstMessage, channelId: townSquareChannel.id, createAt: firstDateEarly.ms});

        // # Post message as sysadmin to Town Square
        cy.postMessageAs({sender: admin, message: secondMessage, channelId: townSquareChannel.id, createAt: secondDateEarly.ms});

        cy.apiGetChannelByName(team.name, 'off-topic').then(({channel: offTopicChannel}) => {
            // # Post message as sysadmin to off topic
            cy.postMessageAs({sender: admin, message: firstOffTopicMessage, channelId: offTopicChannel.id, createAt: firstDateLater.ms});

            // # Post message as new admin to off topic
            cy.postMessageAs({sender: anotherAdmin, message: secondOffTopicMessage, channelId: offTopicChannel.id, createAt: secondDateLater.ms});

            // # Add 10 users and each post random messages to town-square and off-topic channels
            Cypress._.times(10, () => {
                cy.apiCreateUser().then(({user}) => {
                    cy.apiAddUserToTeam(team.id, user.id).then(() => {
                        [townSquareChannel, offTopicChannel].forEach((channel) => {
                            cy.postMessageAs({sender: user, message: getRandomId(), channelId: channel.id});
                        });
                    });
                });
            });
        });
    });
}
