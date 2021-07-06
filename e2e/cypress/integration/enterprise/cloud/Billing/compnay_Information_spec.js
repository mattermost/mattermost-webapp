// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding
// Skip:  @electron @chrome @firefox

import {getRandomLetter} from '../../../../utils/index';


describe('Billing', () => {

    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        // # Disable LDAP
        cy.apiUpdateConfig({LdapSettings: {Enable: false}});
    });

    beforeEach(()=>{
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`)
        });
    })

    it('Billing - Going back to Company Information home screen from Add Company Information screen', () => {
        gotoSystemConsole()
        cy.findByText('Company Information').should('be.visible').click();
        cy.contains('span','Add Company Information').parent().click();
        
        //check for back functionality using back button of edit company information screen
        cy.contains('span','Edit Company Information').prev().click();
        cy.contains('span','Add Company Information').should("be.visible")

        cy.contains('span','Add Company Information').parent().click();

        //check for back functionality using Cancel button
        cy.contains('span','Cancel').parent().click();
        cy.contains('span','Add Company Information').should("be.visible")
    });
});

const gotoSystemConsole =()=>{
    cy.get('.sidebar-header-dropdown__icon').click();
    cy.findByText('System Console').should('be.visible').click();
}
