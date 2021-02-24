// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

const goToSupportPacketGenerationModal = () => {
    cy.findByRole('button', {name: 'Menu Icon'}).should('exist').click();

    cy.findByRole('button', {name: 'Commercial Support dialog'}).click();

    // * Ensure the download support packet button exist and that text regarding setting the proper settings exist
    cy.findByRole('link', {name: 'Download Support Packet'}).should('exist');
};

describe('Support Packet Generation', () => {
    before(() => {
        // Running on E10/E20 License
        cy.apiRequireLicense();
        cy.apiAdminLogin();

        cy.apiUpdateConfig({
            LogSettings: {
                EnableFile: true,
                FileLevel: 'ERROR',
            },
        });
    });

    it('MM-T3849 - Commercial Support Dialog UI - E10/E20 License', () => {
        // # Go to System Console
        goToAdminConsole();

        goToSupportPacketGenerationModal();

        cy.get('.AlertBanner__body').should('have.text', 'Before downloading the support packet, set Output Logs to File to true and set File Log Level to DEBUG here.');
    });

    it('MM-T3818 - Commercial Support Dialog UI - Links', () => {
        // # Go to System Console
        goToAdminConsole();

        goToSupportPacketGenerationModal();

        // * Veryify the links exist that take you to loggin page and ticket page exist
        cy.findByRole('link', {name: 'submit a support ticket.'}).should('have.attr', 'href').and('include', 'https://support.mattermost.com/hc/en-us/requests/new');
        cy.findByRole('link', {name: 'here'}).should('have.attr', 'href').and('include', '/admin_console/environment/logging');
    });
});
