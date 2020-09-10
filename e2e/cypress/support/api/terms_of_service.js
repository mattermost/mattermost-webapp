// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// *****************************************************************************
// Terms of service
// https://api.mattermost.com/#tag/terms-of-service
// *****************************************************************************

Cypress.Commands.add('apiCreateTermsOfService', (text) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/terms_of_service',
        method: 'POST',
        body: {
            text,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response.body);
    });
});
