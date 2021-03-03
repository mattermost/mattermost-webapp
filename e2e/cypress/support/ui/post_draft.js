// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiUploadFiles', () => {
    return cy.get('.file-attachment-menu-item-input');
});
