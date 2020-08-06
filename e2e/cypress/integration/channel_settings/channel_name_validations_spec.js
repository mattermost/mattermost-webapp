// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Channel routing', () => {
    let testUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            // # Login as test user and go to town square
            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T884 Channel name validates against two user IDs being used in URL', () => {
        // # click on create public channel
        cy.get('#createPublicChannel').click();

        // * Verify that the new channel modal is visible
        cy.get('.new-channel__modal').should('be.visible').within(() => {
            cy.get('#newChannelName').type('Test__Channel', {force: true}).wait(TIMEOUTS.HALF_SEC);
            cy.get('#submitNewChannel').click();
        });

        // # Click on channel menu and press rename channel
        cy.get('#channelHeaderDropdownIcon').click();
        cy.findByText('Rename Channel').click();

        // # Assert if the rename modal present
        cy.get('[aria-labelledby="renameChannelModalLabel"').should('be.visible').within(() => {
            // # type the two 26 character strings with 2 underscores between them and click on save
            cy.get('#channel_name').clear().type('uzsfmtmniifsjgesce4u7yznyh__uzsfmtmniifsjgesce5u7yznyh', {force: true}).wait(TIMEOUTS.HALF_SEC);
            cy.get('#save-button').should('be.visible').click();

            // # Assert the error occured with the appropriate message
            cy.get('.input__help').should('have.class', 'error');
            cy.get('.input__help').should('have.text', 'User IDs are not allowed in channel URLs.');
            cy.findByText('Cancel').click();
        });

        // # click on create public channel
        cy.get('#createPublicChannel').click();

        // * Verify that the new channel modal is visible
        cy.get('.new-channel__modal').should('be.visible').within(() => {
            // # Add the new channel name with invalid name and press Create Channel
            cy.get('#newChannelName').type('uzsfmtmniifsjgesce4u7yznyh__uzsfmtmniifsjgesce5u7yznyh', {force: true}).wait(TIMEOUTS.HALF_SEC);
            cy.get('#submitNewChannel').should('be.visible').click();

            // # Assert the error occured with the appropriate message
            cy.get('.has-error').scrollIntoView().should('be.visible').within(() => {
                cy.get('#createChannelError').should('have.text', 'Invalid channel name. User ids are not permitted in channel name for non-direct message channels.');
            });
        });

        // # close the create channel modal
        cy.findByText('Cancel').click();
    });
});
