// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

Cypress.Commands.overwrite('reload', (originalFn, forceReload, options, duration = TIMEOUTS.THREE_SEC) => {
    originalFn(forceReload, options);
    cy.wait(duration);
});

Cypress.Commands.overwrite('visit', (originalFn, url, options, duration = TIMEOUTS.THREE_SEC) => {
    originalFn(url, options);
    cy.wait(duration);
});
