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

import {
    getTestMessages,
    searchAndValidate,
    setupTestData,
} from './helpers';

describe('SF15699 Search Date Filter - mixed', () => {
    const testData = getTestMessages();
    const {
        commonText,
        firstDateEarly,
        secondMessage,
        secondOffTopicMessage,
    } = testData;
    const admin = getAdminAccount();
    let anotherAdmin;

    before(() => {
        cy.apiInitSetup({userPrefix: 'other-admin'}).then(({team, user}) => {
            anotherAdmin = user;

            setupTestData(testData, {team, admin, anotherAdmin});
        });
    });

    it('"before:" and "after:" can be used together', () => {
        searchAndValidate(`before:${Cypress.moment().format('YYYY-MM-DD')} after:${firstDateEarly.query} ${commonText}`, [secondOffTopicMessage, secondMessage]);
    });

    it('"before:", "after:", "from:", and "in:" can be used in one search', () => {
        searchAndValidate(`before:${Cypress.moment().format('YYYY-MM-DD')} after:${firstDateEarly.query} from:${anotherAdmin.username} in:off-topic ${commonText}`, [secondOffTopicMessage]);
    });
});
