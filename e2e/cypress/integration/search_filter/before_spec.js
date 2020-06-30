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

describe('SF15699 Search Date Filter - before', () => {
    const testData = getTestMessages();
    const {
        commonText,
        allMessagesInOrder,
        secondDateEarly,
        firstMessage,
        firstOffTopicMessage,
    } = testData;
    const admin = getAdminAccount();
    let anotherAdmin;

    before(() => {
        cy.apiInitSetup({userPrefix: 'other-admin'}).then(({team, user}) => {
            anotherAdmin = user;

            setupTestData(testData, {team, admin, anotherAdmin});
        });
    });

    it('omits results on and after target date', () => {
        searchAndValidate(`before:${secondDateEarly.query} ${commonText}`, [firstOffTopicMessage, firstMessage]);
    });

    it('can be used in conjunction with "in:"', () => {
        searchAndValidate(`before:${secondDateEarly.query} in:town-square ${commonText}`, [firstMessage]);
    });

    it('can be used in conjunction with "from:"', () => {
        searchAndValidate(`before:${secondDateEarly.query} from:${anotherAdmin.username} ${commonText}`, [firstMessage]);
    });

    it('using a date from the future shows results', () => {
        searchAndValidate(`before:2099-7-15 ${commonText}`, allMessagesInOrder);
    });
});
