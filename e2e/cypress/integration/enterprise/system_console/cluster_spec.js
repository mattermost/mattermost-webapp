// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @system_console

describe('Cluster', () => {
    before(() => {
        // * Check if server has license
        cy.apiRequireLicense();

        // # Reset Experimental Gossip Encryption
        cy.apiUpdateConfig({ClusterSettings: {
            Enable: null,
            UseExperimentalGossip: null,
            EnableExperimentalGossipEncryption: null,
        }});

        // # Visit high availability system console page
        cy.visit('/admin_console/environment/high_availability');
    });

    it('SC25050 - Can change Experimental Gossip Encryption', () => {
        cy.findByTestId('EnableExperimentalGossipEncryption').scrollIntoView().should('be.visible').within(() => {
            // * Verify that setting is visible and matches text content
            cy.get('.control-label').should('be.visible').and('have.text', 'Enable Experimental Gossip encryption:');

            // * Verify that the help setting is visible and matches text content
            const contents = 'When true, all communication through the gossip protocol will be encrypted.';
            cy.get('.help-text').should('be.visible').and('have.text', contents);

            // * Verify that Experimental Gossip Encryption is set to false by default
            cy.get('#EnableExperimentalGossipEncryptionfalse').should('have.attr', 'checked');
        });

        // # Enable Experimental Gossip Encryption
        cy.apiUpdateConfig({ClusterSettings: {
            Enable: true,
            UseExperimentalGossip: true,
            EnableExperimentalGossipEncryption: true,
        }});
        cy.reload();

        cy.findByTestId('EnableExperimentalGossipEncryption').scrollIntoView().should('be.visible').within(() => {
            // * Verify that Experimental Gossip Encryption is set to true
            cy.get('#EnableExperimentalGossipEncryptiontrue').should('have.attr', 'checked');
        });
    });
});
