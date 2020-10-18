// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @search_date_filter

import {getAdminAccount} from '../../support/env';
import * as TIMEOUTS from '../../fixtures/timeouts';

import {
    getTestMessages,
    searchAndValidate,
    setupTestData,
} from './helpers';

describe('SF15699 Search Date Filter - input', () => {
    const testData = getTestMessages();
    const {
        commonText,
        allMessagesInOrder,
        todayMessage,
        firstMessage,
    } = testData;
    const admin = getAdminAccount();
    let anotherAdmin;

    before(() => {
        cy.apiInitSetup({userPrefix: 'other-admin'}).then(({team, user}) => {
            anotherAdmin = user;

            setupTestData(testData, {team, admin, anotherAdmin});
        });
    });

    it('can search for single post without adding a date filter', () => {
        searchAndValidate(todayMessage, [todayMessage]);
    });

    it('can search for posts sharing text', () => {
        searchAndValidate(commonText, allMessagesInOrder);
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
        const queryString = `on:${Cypress.moment().format('YYYY-MM-DD')} ${commonText}`;

        it('with keyboard', () => {
            cy.get('#searchBox').
                clear().
                wait(TIMEOUTS.HALF_SEC).
                type(queryString).
                type('{backspace}'.repeat(queryString.length)).
                should('have.value', '');
        });

        it('with "x"', () => {
            cy.get('#searchBox').clear().wait(TIMEOUTS.HALF_SEC).type(queryString);
            cy.get('#searchFormContainer').find('.input-clear-x').click({force: true});
            cy.get('#searchBox').should('have.value', '');
        });
    });
});
