// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @multi_team_and_dm

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Channel', () => {
    let testTeamId;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeamId = team.id;
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T422_1 Channel name already taken for public channel', () => {
        // # Create a new public channel
        createNewChannel('unique-public', false, testTeamId).as('channel');
        cy.reload();

        cy.get('@channel').then((channel) => {
            // * Verify new public channel cannot be created with existing public channel name
            verifyChannel(channel);
        });
    });

    it('MM-T422_2 Channel name already taken for private channel', () => {
        // # Create a new private channel
        createNewChannel('unique-private', true, testTeamId).as('channel');
        cy.reload();

        cy.get('@channel').then((channel) => {
            // * Verify new private channel cannot be created with existing private channel name
            verifyChannel(channel);
        });
    });
});

/**
* Creates a channel with existing name and verify that error is shown
* @param {String} newChannelName - New channel name to assign
* @param {boolean} makePrivate - Set to false to make public channel (default), otherwise true as private channel
*/
function verifyExistingChannelError(newChannelName, makePrivate = false) {
    // Click on '+' button for Public or Private Channel
    cy.uiBrowseOrCreateChannel('Create New Channel').click();

    if (makePrivate) {
        cy.get('#private').check({force: true}).as('channelType');
    } else {
        cy.get('#public').should('be.checked').as('channelType');
    }

    cy.get('@channelType').should('be.checked');

    // Type `newChannelName` in the input field for new channel
    cy.get('#newChannelName').should('be.visible').click().type(newChannelName);
    cy.wait(TIMEOUTS.HALF_SEC);

    // Click 'Create New Channel' button
    cy.get('#submitNewChannel').click();

    // * User gets a message saying "A channel with that name already exists on the same team"
    cy.get('#createChannelError').contains('A channel with that name already exists on the same team');
}

/**
* Attempts to create public and private channels with existing `channelName` and verifies error
* @param {String} channelName - Existing channel name that is also being tested for error
*/
function verifyChannel(channel) {
    // # Find current number of channels
    cy.uiGetLhsSection('CHANNELS').find('.SidebarChannel').its('length').as('origChannelLength');

    // * Verify channel `channelName` exists
    cy.uiGetLhsSection('CHANNELS').should('contain', channel.display_name);

    // * Verify new public channel cannot be created with existing public channel name
    verifyExistingChannelError(channel.name);

    // # Click on Cancel button to move out of New Channel Modal
    cy.get('#cancelNewChannel').contains('Cancel').click();

    // * Verify new private channel cannot be created with existing public channel name
    verifyExistingChannelError(channel.name, true);

    // # Click on Cancel button to move out of New Channel Modal
    cy.get('#cancelNewChannel').contains('Cancel').click();

    // * Verify the number of channels is still the same as before
    cy.get('@origChannelLength').then((origChannelLength) => {
        cy.uiGetLhsSection('CHANNELS').find('.SidebarChannel').its('length').should('equal', origChannelLength);
    });
}

/**
 * Create new channel via API
 * @param {String} name Name of the channel. This will be used for both name and display_name
 * @param {Boolean} isPrivate Should the channel be private
 * @param {String} testTeamId Team where to create a channel
 * @returns body of request
 */
function createNewChannel(name, isPrivate = false, testTeamId) {
    const makePrivate = isPrivate ? 'P' : 'O';

    return cy.apiCreateChannel(testTeamId, name, name, makePrivate, 'Let us chat here').its('channel');
}
