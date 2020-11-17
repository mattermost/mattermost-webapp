// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @integrations

import * as TIMEOUTS from '../../../fixtures/timeouts';
import * as MESSAGES from '../../../fixtures/messages';

describe('Invalid slash command', () => {
    const incorrectCommand1 = 'notacommand-1';
    const incorrectCommand2 = 'notacommand-2';
    const incorrectCommand3 = 'notacommand-3';

    before(() => {
        // # Login as test user and go to town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T667 - Start message with slash and non-command', () => {
        // # Type a incorrect slash command and press enter
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type(`/${incorrectCommand1} {enter}`);

        // * Check that error message of incorrect command is displayed
        verifyNonCommandErrorMessageIsDisplayed(incorrectCommand1);

        // * Check that focus is still the center textbox
        cy.focused().should('have.id', 'post_textbox');

        // # Backspace in the center textbox and verify error message disappeared
        cy.get('#post_textbox').should('be.visible').type('{backspace}');
        verifyNonCommandErrorMessageIsNotDisplayed(incorrectCommand1);

        // # type another incorrect slash command
        cy.get('#post_textbox').should('be.visible').clear().type(`/${incorrectCommand2} {enter}`);

        // * Check that error message of incorrect command is displayed again
        verifyNonCommandErrorMessageIsDisplayed(incorrectCommand2);

        // # Click on the link to post incorrect command as plain text
        cy.findByText('Click here to send as a message.').should('be.visible').and('exist').click({force: true});

        // * Verify the incorrect command is posted as plain text when we pressed 'click here to send as message' link
        verifyLastPostedMessageContainsPlainTextOfCommand(incorrectCommand2);

        // # Lets try to post incorrect message as plain text via twice enter press
        cy.get('#post_textbox').should('be.visible').clear().type(`/${incorrectCommand3} {enter}`);

        // * Check that error message of incorrect command is displayed again
        verifyNonCommandErrorMessageIsDisplayed(incorrectCommand3);

        // # Lets press enter again in the textbox after error message is shown to submit command as plain text
        cy.get('#post_textbox').should('be.visible').type('{enter}');

        // * Verify incorrect command got posted as plain text message via twice enter press
        verifyLastPostedMessageContainsPlainTextOfCommand(incorrectCommand3);
    });

    it('MM-T668 Start reply with slash and non-command', () => {
        // # Post a message in the center text plane
        cy.postMessage(MESSAGES.SMALL);

        // # To the last message post a reply in RHS
        cy.getLastPostId().then((lastPostID) => {
            cy.clickPostCommentIcon(lastPostID);
            cy.postMessageReplyInRHS(MESSAGES.TINY);
        });

        // # Type a incorrect slash command and press enter in RHS
        cy.get('#reply_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type(`/${incorrectCommand1} {enter}`);

        // # Move the text search for error inside the RHS container only, so we are certain it is rendered below RHS textbox
        cy.get('#rhsContainer').within(() => {
            // * Check that error message of incorrect command is displayed
            verifyNonCommandErrorMessageIsDisplayed(incorrectCommand1);
        });

        // * Check that the focus is still the RHS textbox and not in the center textbox
        cy.focused().should('have.id', 'reply_textbox').and('not.have.id', 'post_textbox');

        // * Verify hitting backspace in the textbox removes the error message
        cy.get('#reply_textbox').should('be.visible').type('{backspace}');
        cy.get('#rhsContainer').within(() => {
            // * Verify error message is not displayed
            verifyNonCommandErrorMessageIsNotDisplayed(incorrectCommand1);
        });

        // # Press enter once with incorrect to allow the error message to show
        cy.get('#reply_textbox').should('be.visible').clear().type(`/${incorrectCommand2} {enter}`);

        // * Check that error message of incorrect command is displayed
        cy.get('#rhsContainer').within(() => {
            verifyNonCommandErrorMessageIsDisplayed(incorrectCommand2);
        });

        // # Lets press enter again to submit it as plain text after error message is shown
        cy.get('#reply_textbox').should('be.visible').type('{enter}');

        // * Verify incorrect command got posted as plain text message via twice enter press
        verifyLastPostedMessageContainsPlainTextOfCommand(incorrectCommand2);

        // # Lets add another incorrect command and press enter
        cy.get('#reply_textbox').should('be.visible').clear().type(`/${incorrectCommand3} {enter}`);

        // * Check that error message of incorrect command is displayed
        cy.get('#rhsContainer').within(() => {
            verifyNonCommandErrorMessageIsDisplayed(incorrectCommand3);
        });

        // # Click on the link to post incorrect command as plain text below textbox
        cy.findByText('Click here to send as a message.').should('exist').click({force: true});

        // * Verify incorrect command got posted as plain text message via clicking link
        verifyLastPostedMessageContainsPlainTextOfCommand(incorrectCommand3);

        // # Close RHS
        cy.closeRHS();
    });
});

function verifyNonCommandErrorMessageIsDisplayed(nonCommand) {
    cy.findByText(`Command with a trigger of '/${nonCommand}' not found.`).should('exist');
    cy.findByText('Click here to send as a message.').should('exist');
}

function verifyNonCommandErrorMessageIsNotDisplayed(nonCommand) {
    cy.findByText(`Command with a trigger of '/${nonCommand}' not found.`).should('not.exist');
    cy.findByText('Click here to send as a message.').should('not.exist');
}

function verifyLastPostedMessageContainsPlainTextOfCommand(nonCommand) {
    // # Get the last posted message
    cy.getLastPostId().then((lastPostId) => {
        cy.get(`#${lastPostId}_message`).within(() => {
            // * Verify the incorrect command is posted as plain text
            cy.findByText(`/${nonCommand}`).should('be.visible').and('exist');
        });
    });
}
