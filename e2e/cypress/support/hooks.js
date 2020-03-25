// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Updates the config with the provided values before the test suite and then resets the config to the previous value
// after the test suite has finished.
export function testWithConfig(config) {
    before(() => {
        let originalConfig;
        cy.apiLogin('sysadmin');
        cy.apiGetConfig().then((resp) => {
            originalConfig = resp.body;
        });

        cy.apiUpdateConfig(config);

        after(() => {
            // # Logging in again since another user session may happen between before and after
            cy.apiLogin('sysadmin');
            cy.apiUpdateConfig(originalConfig);
        });
    });
}
