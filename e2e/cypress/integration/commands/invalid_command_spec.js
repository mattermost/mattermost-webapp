// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @commands

// https://automation-test-cases.vercel.app/test/MM-T667
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Invalid slash command', () => {
    before(() => {
        // # Login as test user and go to town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T667 - Start message with slash and non-command', () => {
        // # Type a incorrect slash command and press enter
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type('/notacommand {enter}');

        // * Check that error message of incorrect command is displayed
        verifyNonCommandErrorMessageIsDisplayed('notacommand');

        // * Check that focus is still the center textbox
        cy.focused().should('have.id', 'post_textbox');

        // # Backspace in the center textbox and verify error message disappeared
        cy.get('#post_textbox').should('be.visible').type('{backspace}');
        verifyNonCommandErrorMessageIsNotDisplayed('notacommand');

        // # type another incorrect slash command
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type('/thisisnotacommandeither {enter}');

        // * Check that error message of incorrect command is displayed again
        verifyNonCommandErrorMessageIsDisplayed('thisisnotacommandeither');

        // # Click on the link to post incorrect command as plain text
        cy.findByText('Click here to send as a message.').should('be.visible').and('exist').click({force: true});

        // # Get the last posted message on the center plane
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).within(() => {
                // * Verify the incorrect command is posted as plain text when we pressed 'click here to send as message' link
                cy.findByText('/thisisnotacommandeither').should('be.visible').and('exist');
            });
        });
    });
});

function verifyNonCommandErrorMessageIsDisplayed(nonCommand) {
    cy.findByText(`Command with a trigger of '/${nonCommand}' not found.`).should('be.visible').and('exist');
}

function verifyNonCommandErrorMessageIsNotDisplayed(nonCommand) {
    cy.findByText(`Command with a trigger of '/${nonCommand}' not found.`).should('not.be.visible').and('not.exist');
}
