// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const { exists } = require("fs");

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding
// Skip:  @electron @chrome @firefox


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

    it('Billing -Contacting sales from Subscription screen', () => {
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.findByText('System Console').should('be.visible').click();
        cy.findByText('Subscription').should('be.visible').click();
        //check the navigation of contact sales link and its href property
        cy.contains('span','Contact Sales').parent().then(link=>{
             const getHref = () => link.prop('href')
             cy.wrap({href:getHref}).invoke('href').should('contains','/contact-us')
             cy.wrap(link).should("have.attr","target","_blank")
             cy.wrap(link).should("have.attr","rel","noopener noreferrer")
             cy.request(link.prop('href')).its('status').should('eq',200)
         })
       
    });

    it('Billing -Closing the Upgrade subscription screen', () => {
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.findByText('System Console').should('be.visible').click();
        cy.findByText('Subscription').should('be.visible').click();

        //check the closing of upgrade subscription window 
        cy.contains('span','Upgrade Mattermost Cloud').parent().click()
        cy.get('#closeIcon').parent().should("exist").click()
        cy.contains('span','Upgrade Mattermost Cloud').parent().should("be.enabled")
    });
});


