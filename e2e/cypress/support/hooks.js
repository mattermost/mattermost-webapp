// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Updates the config with the provided values before the test suite and then resets the config to the previous value
// after the test suite has finished.
export function testWithConfig(config) {
    before(() => {
        let originalConfig;
        cy.apiGetConfig().then((resp) => {
            originalConfig = resp.body;
        });

        cy.apiUpdateConfig(config);

        after(() => {
            cy.apiUpdateConfig(originalConfig);
        });
    });
}
