// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function getBatchName(suffix) {
    return `${Cypress.env('batchName')} - ${suffix}`;
}
