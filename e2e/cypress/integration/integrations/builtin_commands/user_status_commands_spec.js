// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const testCases = [
    {command: '/away', ariaLabel: 'Away Icon', message: 'You are now away'},
    {command: '/dnd', ariaLabel: 'Do Not Disturb Icon', message: 'Do Not Disturb is enabled. You will not receive desktop or mobile push notifications until Do Not Disturb is turned off.'},
    {command: '/offline', ariaLabel: 'Offline Icon', message: 'You are now offline'},
    {command: '/online', ariaLabel: 'Online Icon', message: 'You are now online'},
];

describe('I18456 Built-in slash commands: user status via post', () => {
    before(() => {
        // # Login as user-1, go to "/" and set user status to online
        cy.apiLogin('user-1');
        cy.apiUpdateUserStatus('online');
        cy.apiSaveMessageDisplayPreference('compact');
        cy.visit('/');
    });

    after(() => {
        // # Set user status to online
        cy.apiUpdateUserStatus('online');
    });

    testCases.forEach((testCase) => {
        it(testCase.command, () => {
            // # Post slash command
            cy.postMessage(testCase.command + ' ');

            verifyUserStatus(testCase, true);
        });
    });
});

describe('I18456 Built-in slash commands: user status via suggestion list', () => {
    before(() => {
        // # Login as user-1, go to "/" and set user status to online
        cy.apiLogin('user-1');
        cy.apiUpdateUserStatus('online');
        cy.apiSaveMessageDisplayPreference('clean');
        cy.visit('/');
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

        verifyUserStatus(testCase, false);
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
        verifyUserStatus(testCase, false);
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
        verifyUserStatus(testCase, false);
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
        verifyUserStatus(testCase, false);
    });
});

function verifyUserStatus(testCase, isCompactMode) {
    // * Verify that the user status is as indicated
    cy.get('#lhsHeader').find('svg').should('be.visible').and('have.attr', 'aria-label', testCase.ariaLabel);

    // * Verify that ephemeral message is posted as expected
    cy.getLastPostId().then((postId) => {
        cy.get(`#post_${postId}`).find('.user-popover').should('have.text', 'System');

        if (isCompactMode) {
            cy.get(`#postMessageText_${postId}`).should('have.text', testCase.message + ' (Only visible to you)');
        } else {
            cy.get(`#postMessageText_${postId}`).should('have.text', testCase.message);
            cy.get('.post__visibility').last().should('be.visible').and('have.text', '(Only visible to you)');
        }
    });
}
