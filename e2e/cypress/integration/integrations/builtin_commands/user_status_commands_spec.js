// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const testCases = [
    {command: '/away', ariaLabel: 'Away Icon', message: 'You are now away (Only visible to you)'},
    {command: '/dnd', ariaLabel: 'Do Not Disturb Icon', message: 'Do Not Disturb is enabled. You will not receive desktop or mobile push notifications until Do Not Disturb is turned off. (Only visible to you)'},
    {command: '/offline', ariaLabel: 'Offline Icon', message: 'You are now offline (Only visible to you)'},
    {command: '/online', ariaLabel: 'Online Icon', message: 'You are now online (Only visible to you)'},
];

describe('I18456 Built-in slash commands: user status via post', () => {
    before(() => {
        // # Login as user-1, go to "/" and set user status to online
        cy.apiLogin('user-1');
        cy.visit('/');
        cy.apiUpdateUserStatus('online');
    });

    after(() => {
        // # Set user status to online
        cy.apiUpdateUserStatus('online');
    });

    testCases.forEach((testCase) => {
        it(testCase.command, () => {
            // # Post slash command
            cy.postMessage(testCase.command + ' ');

            verifyUserStatus(testCase);
        });
    });
});

describe('I18456 Built-in slash commands: user status via suggestion list', () => {
    before(() => {
        // # Login as user-1, go to "/" and set user status to online
        cy.apiLogin('user-1');
        cy.visit('/');
        cy.apiUpdateUserStatus('online');
    });

    beforeEach(() => {
        // # Type "/" on textbox
        cy.get('#post_textbox').clear().type('/');
    });

    after(() => {
        // # Set user status to online
        cy.apiUpdateUserStatus('online');
    });

    it('/away', () => {
        const testCase = testCases[0];

        // # Verify that the suggestion list is visible
        cy.get('#suggestionList').should('be.visible').then((container) => {
            // # Find command and click
            cy.getByText(/\/away/, {container}).click({force: true});
        });

        cy.get('#post_textbox').type(' {enter}');

        verifyUserStatus(testCase);
    });

    it('/dnd', () => {
        const testCase = testCases[1];

        // # Verify that the suggestion list is visible
        cy.get('#suggestionList').should('be.visible').then((container) => {
            // # Find command and click
            cy.getByText(/\/dnd/, {container}).click({force: true});
        });

        // # Hit enter and verify user status
        cy.get('#post_textbox').type(' {enter}');
        verifyUserStatus(testCase);
    });

    it('/offline', () => {
        const testCase = testCases[2];

        // # Verify that the suggestion list is visible
        cy.get('#suggestionList').should('be.visible').then((container) => {
            // # Find command and click
            cy.getByText(/\/offline/, {container}).click({force: true});
        });

        // # Hit enter and verify user status
        cy.get('#post_textbox').type(' {enter}');
        verifyUserStatus(testCase);
    });

    it('/online', () => {
        const testCase = testCases[3];

        // # Verify that the suggestion list is visible
        cy.get('#suggestionList').should('be.visible').then((container) => {
            // # Find command and click
            cy.getByText(/\/online/, {container}).click({force: true});
        });

        // # Hit enter and verify user status
        cy.get('#post_textbox').type(' {enter}');
        verifyUserStatus(testCase);
    });
});

function verifyUserStatus(testCase) {
    // * Verify that the user status is as indicated
    cy.get('#lhsHeader').find('svg').should('be.visible').and('have.attr', 'aria-label', testCase.ariaLabel);

    // * Verify that ephemeral message is posted as expected
    cy.getLastPostId().then((postId) => {
        cy.get(`#post_${postId}`).find('.user-popover').should('have.text', 'System');
        cy.get(`#postMessageText_${postId}`).should('have.text', testCase.message);
    });
}
