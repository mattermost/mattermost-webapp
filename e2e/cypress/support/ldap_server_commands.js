// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('modifyLDAPUsers', (filename) => {
    cy.exec(`ldapmodify -x -D "cn=admin,dc=mm,dc=test,dc=com" -w mostest -H ldap://${Cypress.env('ldapServer')}:${Cypress.env('ldapPort')} -f cypress/fixtures/${filename} -c`, {failOnNonZeroExit: false});
});

Cypress.Commands.add('resetLDAPUsers', () => {
    cy.modifyLDAPUsers('ldap-reset-data.ldif');
});
