// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

Cypress.Commands.add('visitAndWait', (url, options, duration = TIMEOUTS.THREE_SEC) => {
    cy.visit(url, options).wait(duration);
});
