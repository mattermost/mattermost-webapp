// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Overwrite log to write messages into console output.
 * Convenient when debugging, especially when running on CI since Cypress don't have this built-in function.
 */
Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));
