// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Feature discovery', () => {
    before(() => {
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console');
    });

    it('MM-25000 - LDAP', () => {
        cy.get('li').contains('AD/LDAP').click();
        cy.get("div[data-testid='featureDiscovery_title']").should('contain', 'LDAP');
    });

    it('MM-25000 - SAML', () => {
        cy.get('li').contains('SAML 2.0').click();
        cy.get("div[data-testid='featureDiscovery_title']").should('contain', 'SAML');
    });
});