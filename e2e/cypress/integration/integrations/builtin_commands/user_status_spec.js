// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

describe('Integrations', () => {
    before(() => {
        // # Login as test user and go to town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    const testCases = [
        {name: 'away', command: '/away', ariaLabel: 'Away Icon', message: 'You are now away'},
        {name: 'offline', command: '/offline', ariaLabel: 'Offline Icon', message: 'You are now offline'},
        {name: 'online', command: '/online', ariaLabel: 'Online Icon', message: 'You are now online'},
    ];

    it('MM-T670 /away', () => {
        // # Set online status and verify it's changed as the initial status
        cy.apiUpdateUserStatus('online');
        cy.findByLabelText('team menu region').findByLabelText('Online Icon').should('be.visible');

        const away = testCases[0];

        verifyUserStatus(away);
    });

    it('MM-T672 /offline', () => {
        // # Set online status and verify it's changed as the initial status
        cy.apiUpdateUserStatus('online');
        cy.findByLabelText('team menu region').findByLabelText('Online Icon').should('be.visible');

        const offline = testCases[1];

        verifyUserStatus(offline);
    });

    it('MM-T674 /online', () => {
        // # Set offline status and verify it's changed as the initial status
        cy.apiUpdateUserStatus('offline');
        cy.findByLabelText('team menu region').findByLabelText('Offline Icon').should('be.visible');

        const online = testCases[2];

        verifyUserStatus(online);
    });
});

function verifyUserStatus(testCase) {
    // # Post slash command to change user status
    cy.postMessage(testCase.command);

    // * Get last post and verify system message
    cy.getLastPost().within(() => {
        cy.findByText(testCase.message);
        cy.findByText('(Only visible to you)');
    });

    // * Verify status shown at user profile in LHS
    cy.findByLabelText('team menu region').findByLabelText(testCase.ariaLabel).should('be.visible');

    // # Post a message
    cy.postMessage(testCase.name);

    // Verify that the profile in the posted message shows correct status
    cy.get('.post__img').last().findByLabelText(testCase.ariaLabel);
}
