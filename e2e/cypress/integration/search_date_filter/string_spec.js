// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAdminAccount} from '../../support/env';

import {
    searchAndValidate,
    getTestMessages,
    setupTestData,
} from '../search_filter/helpers';

describe('Search Date Filter', () => {
    const testData = getTestMessages();
    const {commonText} = testData;
    const admin = getAdminAccount();
    let anotherAdmin;

    before(() => {
        cy.apiInitSetup({userPrefix: 'other-admin'}).then(({team, user}) => {
            anotherAdmin = user;

            // # Visit town-square
            cy.visit(`/${team.name}/channels/town-square`);

            setupTestData(testData, {team, admin, anotherAdmin});
        });
    });

    it('MM-T603 Place a string when a date is expected', () => {
        searchAndValidate(`on:hippo ${commonText}`, []);
        searchAndValidate(`before:hippo ${commonText}`, []);
        searchAndValidate(`after:hippo ${commonText}`, []);
    });
});
