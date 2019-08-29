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
let fullDialog;
const inputTypes = {
    realname: 'input',
    someemail: 'email',
    somenumber: 'number',
    somepassword: 'password',
};

const optionsLength = {
    someuserselector: 25, // default number of users in autocomplete
    somechannelselector: 2, // town-square and off-topic for new team
    someoptionselector: 3, // number of defined basic options
};

describe('ID15888 Interactive Dialog', () => {
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
                description: 'Test for dialog',
                display_name: 'Dialog',
                icon_url: '',
                method: 'P',
                team_id: team.id,
                trigger: 'dialog',
                url: `${webhookBaseUrl}/dialog_request`,
                username: '',
            };

            cy.apiCreateCommand(command).then(({data}) => {
                createdCommand = data;
                fullDialog = webhookUtils.getFullDialog(createdCommand.id, webhookBaseUrl);
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
                cy.get('#interactiveDialogIconUrl').should('be.visible').and('have.attr', 'src', fullDialog.dialog.icon_url);
                cy.get('#interactiveDialogModalLabel').should('be.visible').and('have.text', fullDialog.dialog.title);
                cy.wrap($elForm).find('button.close').should('be.visible').and('contain', '×').and('contain', 'Close');

                cy.get('#interactiveDialogModalLabel').should('be.visible').and('have.text', fullDialog.dialog.title);
            });

            // * Verify that the body contains all the elements
            cy.get('.modal-body').should('be.visible').children().each(($elForm, index) => {
                const element = fullDialog.dialog.elements[index];

                cy.wrap($elForm).find('label.control-label').scrollIntoView().should('be.visible').and('have.text', `${element.display_name} ${element.optional ? '(optional)' : '*'}`);

                if (['someuserselector', 'somechannelselector', 'someoptionselector'].includes(element.name)) {
                    cy.wrap($elForm).find('input').should('be.visible').and('have.attr', 'autocomplete', 'off').and('have.attr', 'placeholder', element.placeholder);

                    // * Verify that the suggestion list or autocomplete open up on click of input element
                    cy.wrap($elForm).find('#suggestionList').should('not.be.visible');
                    cy.wrap($elForm).find('input').click();
                    cy.wrap($elForm).find('#suggestionList').should('be.visible').children().should('have.length', optionsLength[element.name]);
                } else {
                    cy.wrap($elForm).find(`#${element.name}`).should('be.visible').and('have.value', element.default).and('have.attr', 'placeholder', element.placeholder);
                }

                // * Verify that input element are given with the correct type of "input", "email", "number" and "password".
                // * To take advantage of supported built-in validation.
                if (inputTypes[element.name]) {
                    cy.wrap($elForm).find(`#${element.name}`).should('have.attr', 'type', inputTypes[element.name]);
                }

                if (element.help_text) {
                    cy.wrap($elForm).find('.help-text').should('be.visible').and('have.text', element.help_text);
                }
            });

            // * Verify that the footer contains cancel and submit buttons
            cy.get('.modal-footer').should('be.visible').within(($elForm) => {
                cy.wrap($elForm).find('#interactiveDialogCancel').should('be.visible').and('have.text', 'Cancel');
                cy.wrap($elForm).find('#interactiveDialogSubmit').should('be.visible').and('have.text', fullDialog.dialog.submit_label);
            });

            closeInteractiveDialog();
        });
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
    });

    it('Correct error messages displayed if empty form is submitted', () => {
        // # Post a slash command
        cy.postMessage(`/${createdCommand.trigger}`);

        // * Verify that the interactive dialog modal open up
        cy.get('#interactiveDialogModal').should('be.visible');

        // # Click submit button from the modal
        cy.get('#interactiveDialogSubmit').click();

        // * Verify that the interactive dialog modal is still open
        cy.get('#interactiveDialogModal').should('be.visible');

        // * Verify that not optional element without text value shows an error and vice versa
        cy.get('.modal-body').should('be.visible').children().each(($elForm, index) => {
            const element = fullDialog.dialog.elements[index];

            if (!element.optional && !element.default) {
                cy.wrap($elForm).find('div.error-text').scrollIntoView().should('be.visible').and('have.text', 'This field is required.').and('have.css', 'color', 'rgb(253, 89, 96)');
            } else {
                cy.wrap($elForm).find('div.error-text').should('not.be.visible');
            }
        });

        closeInteractiveDialog();
    });

    it('Email validation', () => {
        // # Post a slash command
        cy.postMessage(`/${createdCommand.trigger}`);

        // * Verify that the interactive dialog modal open up
        cy.get('#interactiveDialogModal').should('be.visible');

        // # Enter invalid and valid email
        // Verify that error is: shown for invalid email and not shown for valid email.
        [
            {valid: false, value: 'invalid-email'},
            {valid: true, value: 'test@mattermost.com'},
        ].forEach((testCase) => {
            cy.get('#someemail').scrollIntoView().clear().type(testCase.value);

            cy.get('#interactiveDialogSubmit').click();

            cy.get('.modal-body').should('be.visible').children().eq(1).within(($elForm) => {
                if (testCase.valid) {
                    cy.wrap($elForm).find('div.error-text').should('not.be.visible');
                } else {
                    cy.wrap($elForm).find('div.error-text').should('be.visible').and('have.text', 'Must be a valid email address.').and('have.css', 'color', 'rgb(253, 89, 96)');
                }
            });
        });

        closeInteractiveDialog();
    });

    it('Number validation', () => {
        cy.postMessage(`/${createdCommand.trigger}`);

        cy.get('#interactiveDialogModal').should('be.visible');

        // # Enter invalid and valid number
        // Verify that error is: shown for invalid number and not shown for valid number.
        [
            {valid: false, value: 'invalid-number'},
            {valid: true, value: 12},
        ].forEach((testCase) => {
            cy.get('#somenumber').scrollIntoView().type(testCase.value);

            cy.get('#interactiveDialogSubmit').click();

            cy.get('.modal-body').should('be.visible').children().eq(2).within(($elForm) => {
                if (testCase.valid) {
                    cy.wrap($elForm).find('div.error-text').should('not.be.visible');
                } else {
                    cy.wrap($elForm).find('div.error-text').should('be.visible').and('have.text', 'This field is required.').and('have.css', 'color', 'rgb(253, 89, 96)');
                }
            });
        });

        closeInteractiveDialog();
    });
});

function closeInteractiveDialog() {
    cy.get('.modal-header').should('be.visible').within(($elForm) => {
        cy.wrap($elForm).find('button.close').should('be.visible').click();
    });
    cy.get('#interactiveDialogModal').should('not.be.visible');
}
