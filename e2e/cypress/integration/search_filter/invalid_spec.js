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

describe('SF15699 Search Date Filter - invalid', () => {
    const testData = getTestMessages();
    const {commonText} = testData;
    const admin = getAdminAccount();
    let anotherAdmin;

    before(() => {
        cy.apiInitSetup({userPrefix: 'other-admin'}).then(({team, user}) => {
            anotherAdmin = user;

            setupTestData(testData, {team, admin, anotherAdmin});
        });
    });

    it('wrong format returns no results', () => {
        searchAndValidate(`before:123-456-789 ${commonText}`);
    });

    it('correct format, invalid date returns no results', () => {
        searchAndValidate(`before:2099-15-45 ${commonText}`);
    });

    it('invalid leap year returns no results', () => {
        searchAndValidate(`after:2018-02-29 ${commonText}`);
    });

    it('using invalid string for date returns no results', () => {
        searchAndValidate(`before:banana ${commonText}`);
    });
});
