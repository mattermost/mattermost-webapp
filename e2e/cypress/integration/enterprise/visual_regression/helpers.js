// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const applitoolsConfig = require('../../../../applitools.config');

export function getBatchName(suffix) {
    const batchName = Cypress.env('batchName') || applitoolsConfig.batchName;
    return `${batchName} - ${suffix}`;
}
