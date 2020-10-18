// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function getAdminAccount() {
    return {
        username: Cypress.env('adminUsername'),
        password: Cypress.env('adminPassword'),
    };
}

export function getDBConfig() {
    return {
        client: Cypress.env('dbClient'),
        connection: Cypress.env('dbConnection'),
    };
}
