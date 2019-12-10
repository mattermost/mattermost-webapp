// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
* Note: This test requires webhook server running. Initiate `npm run start:webhook` to start.
*/

const webhookUtils = require('../../../utils/webhook_utils');

let createdCommand;
let simpleDialog;

describe('Interactive Dialog', () => {
    describe('ID17212 Interactive Dialog without element', () => {
        before(() => {
            // Set required ServiceSettings
            const newSettings = {
                ServiceSettings: {
                    AllowedUntrustedInternalConnections: 'localhost',
                    EnablePostUsernameOverride: true,
                    EnablePostIconOverride: true,
                },
            };
            cy.apiUpdateConfig(newSettings);

            // # Login as sysadmin and ensure that teammate name display setting is set to default 'username'
            cy.apiLogin('sysadmin');
            cy.apiSaveTeammateNameDisplayPreference('username');

            // # Create new team and create command on it
            cy.apiCreateTeam('test-team', 'Test Team').then((teamResponse) => {
                const team = teamResponse.body;
                cy.visit(`/${team.name}`);

                const webhookBaseUrl = Cypress.env().webhookBaseUrl;

                const command = {
                    auto_complete: false,
                    description: 'Test for simple dialog - no element',
                    display_name: 'Simple Dialog without element',
                    icon_url: '',
                    method: 'P',
                    team_id: team.id,
                    trigger: 'simple_dialog' + Date.now(),
                    url: `${webhookBaseUrl}/simple_dialog_request`,
                    username: '',
                };

                cy.apiCreateCommand(command).then(({data}) => {
                    createdCommand = data;
                    simpleDialog = webhookUtils.getSimpleDialog(createdCommand.id, webhookBaseUrl);
                });
            });
        });

        it('UI check', () => {
            // # Post a slash command
            cy.postMessage(`/${createdCommand.trigger}`);

            // * Verify that the interactive dialog modal open up
            cy.get('#interactiveDialogModal').should('be.visible').within(() => {
                // * Verify that the header of modal contains icon URL, title and close button
                cy.get('.modal-header').should('be.visible').within(($elForm) => {
                    cy.get('#interactiveDialogIconUrl').should('be.visible').and('have.attr', 'src', simpleDialog.dialog.icon_url);
                    cy.get('#interactiveDialogModalLabel').should('be.visible').and('have.text', simpleDialog.dialog.title);
                    cy.wrap($elForm).find('button.close').should('be.visible').and('contain', '×').and('contain', 'Close');
                });

                // * Verify that the body is not present
                cy.get('.modal-body').should('not.be.visible');

                // * Verify that the footer contains cancel and submit buttons
                cy.get('.modal-footer').should('be.visible').within(($elForm) => {
                    cy.wrap($elForm).find('#interactiveDialogCancel').should('be.visible').and('have.text', 'Cancel');
                    cy.wrap($elForm).find('#interactiveDialogSubmit').should('be.visible').and('have.text', simpleDialog.dialog.submit_label);
                });

                closeInteractiveDialog();
            });
        });

        it('"X" closes the dialog', () => {
            // # Post a slash command
            cy.postMessage(`/${createdCommand.trigger}`);

            // * Verify that the interactive dialog modal open up
            cy.get('#interactiveDialogModal').should('be.visible');

            // # Click "X" button from the modal
            cy.get('.modal-header').should('be.visible').within(($elForm) => {
                cy.wrap($elForm).find('button.close').should('be.visible').click();
            });

            // * Verify that the interactive dialog modal is closed
            cy.get('#interactiveDialogModal').should('not.be.visible');

            // * Verify that the last post states that the dialog is cancelled
            cy.getLastPost().should('contain', 'Dialog cancelled');
        });

        it('Cancel button works', () => {
            // # Post a slash command
            cy.postMessage(`/${createdCommand.trigger}`);

            // * Verify that the interactive dialog modal open up
            cy.get('#interactiveDialogModal').should('be.visible');

            // # Click cancel from the modal
            cy.get('#interactiveDialogCancel').click();

            // * Verify that the interactive dialog modal is closed
            cy.get('#interactiveDialogModal').should('not.be.visible');

            // * Verify that the last post states that the dialog is cancelled
            cy.getLastPost().should('contain', 'Dialog cancelled');
        });

        it('Submit button works', () => {
            // # Post a slash command
            cy.postMessage(`/${createdCommand.trigger}`);

            // * Verify that the interactive dialog modal open up
            cy.get('#interactiveDialogModal').should('be.visible');

            // # Click submit from the modal
            cy.get('#interactiveDialogSubmit').click();

            // * Verify that the interactive dialog modal is closed
            cy.get('#interactiveDialogModal').should('not.be.visible');

            // * Verify that the last post states that the dialog is submitted
            cy.getLastPost().should('contain', 'Dialog submitted');
        });
    });
});

function closeInteractiveDialog() {
    cy.get('.modal-header').should('be.visible').within(($elForm) => {
        cy.wrap($elForm).find('button.close').should('be.visible').click();
    });
    cy.get('#interactiveDialogModal').should('not.be.visible');
}
