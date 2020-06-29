// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const {enableVisualTest, enableApplitools} = Cypress.env();
const isEnabled = enableVisualTest && enableApplitools;

if (isEnabled) {
    // Only add Applitools commands if all are set for visual testing
    require('@applitools/eyes-cypress/commands'); // eslint-disable-line global-require
}

Cypress.Commands.add('visualEyesOpen', (options) => {
    if (isEnabled) {
        cy.eyesOpen(options);
    }
});

Cypress.Commands.add('visualEyesClose', () => {
    if (isEnabled) {
        cy.eyesClose();
    }
});

Cypress.Commands.add('visualSaveSnapshot', (options) => {
    if (isEnabled) {
        cy.eyesCheckWindow(options);
    }
});
