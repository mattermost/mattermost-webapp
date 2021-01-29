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

describe('Integrations', () => {
    before(() => {
        // # Login as test user and go to town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    const testCases = [
        {name: 'away', ariaLabel: 'Away Icon', message: 'You are now away'},
        {name: 'offline', ariaLabel: 'Offline Icon', message: 'You are now offline'},
        {name: 'online', ariaLabel: 'Online Icon', message: 'You are now online'},
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

        // # Switch to off-topic channel
        cy.findByLabelText('public channels').findByText('Off-Topic').click();
        cy.findByLabelText('channel header region').findByText('Off-Topic').should('be.visible');

        // # Then switch back to town-square channel again
        cy.findByLabelText('public channels').findByText('Town Square').click();
        cy.findByLabelText('channel header region').findByText('Town Square').should('be.visible');

        // * Should not appear "New Messages" line
        cy.findByText('New Messages').should('not.exist');

        // # Get the system message
        cy.uiGetNthPost(-2).within(() => {
            cy.findByText(offline.message);

            // * Verify system message profile is visible and without status
            cy.findByLabelText('Mattermost Logo').should('be.visible');
            cy.get('.post__img').find('.status').should('not.exist');
        });
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
    // # Clear then type '/'
    cy.get('#post_textbox').should('be.visible').clear().type('/');

    // * Verify that the suggestion list is visible
    cy.get('#suggestionList').should('be.visible');

    // # Post slash command to change user status
    cy.get('#post_textbox').type(`${testCase.name}{enter}`).wait(TIMEOUTS.ONE_HUNDRED_MILLIS).type('{enter}');

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
