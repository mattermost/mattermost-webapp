// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';
import TIMEOUTS from '../../fixtures/timeouts';

function searchAndValidate(query, expectedResults = []) {
    cy.reload();

    // # Enter in search query, and hit enter
    cy.get('#searchBox').clear().wait(500).type(query).wait(500).type('{enter}');

    cy.get('#loadingSpinner').should('not.be.visible');
    cy.get('#search-items-container', {timeout: TIMEOUTS.HUGE}).should('be.visible');

    // * Verify the amount of results matches the amount of our expected results
    cy.queryAllByTestId('search-item-container').should('have.length', expectedResults.length).then((results) => {
        if (expectedResults.length > 0) {
            // * Verify text of each result
            cy.wrap(results).each((result, index) => {
                cy.wrap(result).find('.post-message').should('have.text', expectedResults[index]);
            });
        } else {
            // * If we expect no results, verify results message
            cy.get('#noResultsMessage').should('be.visible').and('have.text', 'No results found. Try again?');
        }
    });

    cy.get('#searchResultsCloseButton').click();
    cy.get('.search-item__container').should('not.exist');
}

function getMsAndQueryForDate(date) {
    return {
        ms: date,
        query: new Date(date).toISOString().split('T')[0],
    };
}

function changeTimezone(timezone) {
    cy.apiPatchMe({timezone: {automaticTimezone: '', manualTimezone: timezone, useAutomaticTimezone: 'false'}});
}

describe('SF15699 Search Date Filter', () => {
    // Store unique timestamp
    const timestamp = Date.now();

    // Setup Messages
    const todayMessage = `Today's message ${timestamp}`;
    const firstMessage = `First message ${timestamp}`;
    const secondMessage = `Second message ${timestamp}`;
    const firstOffTopicMessage = `Off topic 1 ${timestamp}`;
    const secondOffTopicMessage = `Off topic 2 ${timestamp}`;

    // Store messages in expected order they'd appear
    const allMessagesInOrder = [
        todayMessage,
        secondOffTopicMessage,
        secondMessage,
        firstOffTopicMessage,
        firstMessage,
    ];

    // Get dates for query and in ms for usage below
    const firstDateEarly = getMsAndQueryForDate(Date.UTC(2018, 5, 5, 9, 30)); // June 5th, 2018 @ 9:30am
    const firstDateLater = getMsAndQueryForDate(Date.UTC(2018, 5, 5, 9, 45)); // June 5th, 2018 @ 9:45am
    const secondDateEarly = getMsAndQueryForDate(Date.UTC(2018, 9, 15, 13, 15)); // October 15th, 2018 @ 1:15pm
    const secondDateLater = getMsAndQueryForDate(Date.UTC(2018, 9, 15, 13, 25)); // October 15th, 2018 @ 1:25pm

    const baseUrl = Cypress.config('baseUrl');
    let newAdmin;

    before(() => {
        // # Login as the sysadmin.
        cy.apiLogin('sysadmin');

        // # Change timezone to UTC so we are in sync with the backend
        changeTimezone('UTC');

        // # Create a new team
        cy.apiCreateTeam('filter-test', 'filter-test').its('body').as('team');

        // # Get team name and visit that team
        cy.get('@team').then((team) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });

        // # Create a post from today
        cy.get('#postListContent', {timeout: TIMEOUTS.LARGE}).should('be.visible');
        cy.postMessage(todayMessage);

        // # Create another admin user so we can create posts from another user
        cy.get('@team').then((team) => {
            cy.createNewUser({}, [team.id]).as('newAdmin');
        });

        // # Set user to be a sysadmin, so it can access the system console
        cy.get('@newAdmin').then((user) => {
            newAdmin = user;
            cy.externalRequest({user: users.sysadmin, method: 'put', baseUrl, path: `users/${user.id}/roles`, data: {roles: 'system_user system_admin'}});
        });

        // # Create messages at specific dates in Town Square
        cy.getCurrentChannelId().then((channelId) => {
            // Post message as new admin to Town Square
            cy.get('@newAdmin').then((user) => {
                cy.postMessageAs({sender: user, message: firstMessage, channelId, createAt: firstDateEarly.ms});
            });

            // Post message as sysadmin to Town Square
            cy.postMessageAs({sender: users.sysadmin, message: secondMessage, channelId, createAt: secondDateEarly.ms});
        });

        // # Create messages at same dates in Off Topic channel
        cy.get('@team').then((team) => {
            cy.visit(`/${team.name}/channels/off-topic`);
        });

        cy.getCurrentChannelId().then((channelId) => {
            // Post message as sysadmin to off topic
            cy.postMessageAs({sender: users.sysadmin, message: firstOffTopicMessage, channelId, createAt: firstDateLater.ms});

            // Post message as new admin to off topic
            cy.get('@newAdmin').then((user) => {
                cy.postMessageAs({sender: user, message: secondOffTopicMessage, channelId, createAt: secondDateLater.ms});
            });
        });
    });

    describe('input date filter', () => {
        it('can search for single post without adding a date filter', () => {
            searchAndValidate(todayMessage, [todayMessage]);
        });

        it('can search for posts sharing text', () => {
            searchAndValidate(timestamp, allMessagesInOrder);
        });

        it('with calendar picker to set date', () => {
            const today = Cypress.moment().format('YYYY-MM-DD');

            // # Type before: in search field
            cy.get('#searchBox').clear().type('before:');

            // * Day picker should be visible
            cy.get('.DayPicker').
                as('dayPicker').
                should('be.visible');

            // # Select today's day
            cy.get('@dayPicker').
                find('.DayPicker-Day--today').click();

            cy.get('@dayPicker').should('not.exist');

            // * Verify date picker output gets put into field as expected date
            cy.get('#searchBox').should('have.value', `before:${today} `);
        });

        it('backspace after last character of filter makes calendar reappear', () => {
            const today = Cypress.moment().format('YYYY-MM-DD');

            // # Type before: in search field
            cy.get('#searchBox').clear().type('before:');

            // * Day picker should be visible
            cy.get('.DayPicker').
                as('dayPicker').
                should('be.visible');

            // # Select today's day
            cy.get('@dayPicker').
                find('.DayPicker-Day--today').click();

            // * Day picker should disappear
            cy.get('@dayPicker').should('not.exist');

            // # Hit backspace with focus right after the date
            cy.get('#searchBox').
                should('have.value', `before:${today} `).
                focus().
                type('{backspace}');

            // * Day picker should reappear
            cy.get('@dayPicker').should('be.visible');
        });

        describe('works without leading 0 in', () => {
            // These must match the date of the firstMessage, only altering leading zeroes
            const tests = [
                {name: 'day', date: '2018-06-5'},
                {name: 'month', date: '2018-6-05'},
                {name: 'month and date', date: '2018-6-5'},
            ];

            before(() => {
                cy.reload();
            });

            tests.forEach((test) => {
                it(test.name, () => {
                    searchAndValidate(`on:${test.date} "${firstMessage}"`, [firstMessage]);
                });
            });
        });

        describe('query string can be removed with', () => {
            const queryString = `on:${Cypress.moment().format('YYYY-MM-DD')} ${timestamp}`;

            it('with keyboard', () => {
                cy.get('#searchBox').
                    clear().
                    wait(500).
                    type(queryString).
                    type('{backspace}'.repeat(queryString.length)).
                    should('have.value', '');
            });

            it('with "x"', () => {
                cy.get('#searchBox').clear().wait(500).type(queryString);
                cy.get('#searchFormContainer').find('.input-clear-x').click({force: true});
                cy.get('#searchBox').should('have.value', '');
            });
        });
    });

    describe('"before:"', () => {
        it('omits results on and after target date', () => {
            searchAndValidate(`before:${secondDateEarly.query} ${timestamp}`, [firstOffTopicMessage, firstMessage]);
        });

        it('can be used in conjunction with "in:"', () => {
            searchAndValidate(`before:${secondDateEarly.query} in:town-square ${timestamp}`, [firstMessage]);
        });

        it('can be used in conjunction with "from:"', () => {
            searchAndValidate(`before:${secondDateEarly.query} from:${newAdmin.username} ${timestamp}`, [firstMessage]);
        });

        it('using a date from the future shows results', () => {
            searchAndValidate(`before:2099-7-15 ${timestamp}`, allMessagesInOrder);
        });
    });

    describe('"after:"', () => {
        it('omits results before and on target date', () => {
            searchAndValidate(`after:${firstDateEarly.query} ${timestamp}`, [todayMessage, secondOffTopicMessage, secondMessage]);
        });

        it('can be used in conjunction with "in:"', () => {
            searchAndValidate(`after:${firstDateEarly.query} in:town-square ${timestamp}`, [todayMessage, secondMessage]);
        });

        it('can be used in conjunction with "from:"', () => {
            searchAndValidate(`after:${firstDateEarly.query} from:${newAdmin.username} ${timestamp}`, [secondOffTopicMessage]);
        });

        it('using a date from the future shows no results', () => {
            searchAndValidate(`after:2099-7-15 ${timestamp}`);
        });
    });

    describe('"on:"', () => {
        it('omits results before and after target date', () => {
            searchAndValidate(`on:${secondDateEarly.query} ${timestamp}`, [secondOffTopicMessage, secondMessage]);
        });

        it('takes precedence over "after:" and "before:"', () => {
            searchAndValidate(`before:${Cypress.moment().format('YYYY-MM-DD')} on:${secondDateEarly.query} ${timestamp}`, [secondOffTopicMessage, secondMessage]);
        });

        it('takes precedence over "after:"', () => {
            searchAndValidate(`after:${firstDateEarly.query} on:${secondDateEarly.query} ${timestamp}`, [secondOffTopicMessage, secondMessage]);
        });

        it('can be used in conjunction with "in:"', () => {
            searchAndValidate(`on:${secondDateEarly.query} in:town-square ${timestamp}`, [secondMessage]);
        });

        it('can be used in conjunction with "from:"', () => {
            searchAndValidate(`on:${secondDateEarly.query} from:${newAdmin.username} ${timestamp}`, [secondOffTopicMessage]);
        });

        it('works from 12:00am to 11:59pm', () => {
            // create posts on a day att 11:59 the previous day, 12:00am the main day, 11:59pm the main day, and 12:00 the next day
            const identifier = 'christmas' + Date.now();

            const preTarget = getMsAndQueryForDate(Date.UTC(2018, 11, 24, 23, 59)); // December 24th, 2018 @ 11:59pm
            const targetAM = getMsAndQueryForDate(Date.UTC(2018, 11, 25, 0, 0)); // December 25th, 2018 @ 12:00am
            const targetPM = getMsAndQueryForDate(Date.UTC(2018, 11, 25, 23, 59)); // December 25th, 2018 @ 11:59pm
            const postTarget = getMsAndQueryForDate(Date.UTC(2018, 11, 26, 0, 0)); // December 26th, 2018 @ 12:00am

            const targetAMMessage = 'targetAM ' + identifier;
            const targetPMMessage = 'targetPM ' + identifier;

            // Post same message at different times
            cy.getCurrentChannelId().then((channelId) => {
                cy.postMessageAs({sender: users.sysadmin, message: 'pretarget ' + identifier, channelId, createAt: preTarget.ms});
                cy.postMessageAs({sender: users.sysadmin, message: targetAMMessage, channelId, createAt: targetAM.ms});
                cy.postMessageAs({sender: users.sysadmin, message: targetPMMessage, channelId, createAt: targetPM.ms});
                cy.postMessageAs({sender: users.sysadmin, message: 'postTarget' + identifier, channelId, createAt: postTarget.ms});
            });

            // * Verify we only see messages from the expected date, and not outside of it
            searchAndValidate(`on:${targetAM.query} ${identifier}`, [targetPMMessage, targetAMMessage]);
        });

        it('using a date from the future shows no results', () => {
            searchAndValidate(`on:2099-7-15 ${timestamp}`);
        });
    });

    describe('invalid dates', () => {
        it('wrong format returns no results', () => {
            searchAndValidate(`before:123-456-789 ${timestamp}`);
        });

        it('correct format, invalid date returns no results', () => {
            searchAndValidate(`before:2099-15-45 ${timestamp}`);
        });

        it('invalid leap year returns no results', () => {
            searchAndValidate(`after:2018-02-29 ${timestamp}`);
        });

        it('using invalid string for date returns no results', () => {
            searchAndValidate(`before:banana ${timestamp}`);
        });
    });

    describe('mixed filters', () => {
        it('"before:" and "after:" can be used together', () => {
            searchAndValidate(`before:${Cypress.moment().format('YYYY-MM-DD')} after:${firstDateEarly.query} ${timestamp}`, [secondOffTopicMessage, secondMessage]);
        });

        it('"before:", "after:", "from:", and "in:" can be used in one search', () => {
            searchAndValidate(`before:${Cypress.moment().format('YYYY-MM-DD')} after:${firstDateEarly.query} from:${newAdmin.username} in:off-topic ${timestamp}`, [secondOffTopicMessage]);
        });
    });

    describe('edit search with date filter', () => {
        it('with calendar picker and results update', () => {
            // # Create expected data
            const targetMessage = 'calendarUpdate' + Date.now();
            const targetDate = getMsAndQueryForDate(Date.UTC(2019, 0, 15, 9, 30));

            // # Post message with unique text
            cy.getCurrentChannelId().then((channelId) => {
                cy.postMessageAs({sender: users.sysadmin, message: targetMessage, channelId, createAt: targetDate.ms});
            });

            // # Set clock to custom date, reload page for it to take effect
            cy.clock(targetDate.ms, ['Date']);
            cy.reload();

            // # Type on: into search field
            cy.get('#searchBox').clear().type('on:');

            // * Day picker should appear
            cy.get('.DayPicker').
                as('dayPicker').
                should('be.visible');

            // # Click on today's date
            cy.get('@dayPicker').
                find('.DayPicker-Day--today').click();

            // * Search field should populate with the correct date, then send rest of query
            cy.get('#searchBox').
                should('have.value', 'on:2019-01-15 ').
                focus().
                type(`${targetMessage}{enter}`);

            cy.get('#loadingSpinner').should('not.be.visible');

            // * Verify we see our single result
            cy.queryAllByTestId('search-item-container').
                should('be.visible').
                and('have.length', 1).
                find('.post-message').
                should('have.text', targetMessage);

            cy.reload();

            // # Back space right after the date to bring up date picker again
            cy.get('#searchBox').focus().clear().
                type(`on:2019-01-15 ${targetMessage}`).
                type('{leftarrow}'.repeat(targetMessage.length + 1)).
                type('{backspace}');

            // * Day picker should be visible
            cy.get('@dayPicker').should('be.visible');

            // # Click on tomorrow's day
            cy.get('@dayPicker').
                find('.DayPicker-Day--today').
                next('.DayPicker-Day').click();

            // # Add message to search for, and hit enter
            cy.get('#searchBox').
                should('have.value', `on:2019-01-16  ${targetMessage}`).
                type('{enter}');

            cy.get('#loadingSpinner').should('not.be.visible');

            // * There should be no results
            cy.queryAllByTestId('search-item-container').should('have.length', 0);
        });

        it('changing timezone changes day search results appears', () => {
            const identifier = 'timezone' + Date.now();

            const target = getMsAndQueryForDate(Date.UTC(2018, 9, 31, 23, 59));

            const targetMessage = 'targetAM ' + identifier;

            // # Post message with unique text
            cy.getCurrentChannelId().then((channelId) => {
                cy.postMessageAs({sender: users.sysadmin, message: targetMessage, channelId, createAt: target.ms});
            });

            // * Verify result appears in current timezone
            searchAndValidate(`on:${target.query} ${identifier}`, [targetMessage]);

            // # Change timezone to alter what posts appear in results
            changeTimezone('Europe/Brussels');

            // * With same query, no results should appear
            searchAndValidate(`on:${target.query} ${identifier}`);
        });
    });
});
