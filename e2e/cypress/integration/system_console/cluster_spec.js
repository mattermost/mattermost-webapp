// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

describe('Cluster', () => {
    before(() => {
        // # Visit customization system console page
        cy.visit('/admin_console/environment/high_availability');
    });

    it('SC25050 - Can change Experimental Gossip Encryption', () => {
        cy.findByTestId('EnableExperimentalGossipEncryption').scrollIntoView().should('be.visible').within(() => {
            // Verify that setting is visible and matches text content
            cy.get('.control-label').should('be.visible').and('have.text', 'Enable Experimental Gossip encryption:');

            // Verify that the help setting is visible and matches text content
            const contents = 'When true, all communication through the gossip protocol will be encrypted.';
            cy.get('.help-text').should('be.visible').and('have.text', contents);

            // Verify that the default value is false.
            cy.get('#EnableExperimentalGossipEncryptionfalse').should('have.attr', 'checked');
        });

        // Now change the config
        cy.apiUpdateConfig({ClusterSettings: {
            Enable: true,
            UseExperimentalGossip: true,
            EnableExperimentalGossipEncryption: true,
        }});
        cy.reload();

        cy.findByTestId('EnableExperimentalGossipEncryption').scrollIntoView().should('be.visible').within(() => {
            // Verify that the setting has now changed..
            cy.get('#EnableExperimentalGossipEncryptiontrue').should('have.attr', 'checked');
        });
    });
});
