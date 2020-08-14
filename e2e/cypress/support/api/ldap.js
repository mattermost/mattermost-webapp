// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// *****************************************************************************
// LDAP
// https://api.mattermost.com/#tag/LDAP
// *****************************************************************************

Cypress.Commands.add('apiLDAPSync', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/ldap/sync',
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiLDAPTest', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/ldap/test',
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});
