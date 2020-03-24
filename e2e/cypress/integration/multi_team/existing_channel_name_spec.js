// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
* Creates a channel with existing name and verify that error is shown
* @param {String} channelTypeID - ID of public or private channel to create
* @param {String} newChannelName - New channel name to assign
*/
function verifyExistingChannelError(newChannelName, makePrivate = false) {
    const channelTypeID = makePrivate ? '#createPrivateChannel' : '#createPublicChannel';

    // Click on '+' button for Public or Private Channel
    cy.get(channelTypeID).click({force: true});

    if (makePrivate) {
        cy.get('#private').check({force: true}).as('channelType');
    } else {
        cy.get('#public').should('be.checked').as('channelType');
    }

    cy.get('@channelType').should('be.checked');

    // Type `newChannelName` in the input field for new channel
    cy.get('#newChannelName').type(newChannelName);

    // Click 'Create New Channel' button
    cy.get('#submitNewChannel').click();

    // * User gets a message saying "A channel with that name already exists on the same team"
    cy.get('#createChannelError').contains('A channel with that name already exists on the same team');
}

/**
* Attempts to create public and private channels with existing `channelName` and verifies error
* @param {String} channelTypeHeading - PUBLIC CHANNELS or PRIVATE CHANNELS
* @param {String} channelName - Existing channel name that is also being tested for error
* var - origChannelLength:    The original number of channels in PUBLIC CHANNELS or PRIVATE CHANNELS
*/
function channelNameTest(channelTypeHeading, channel) {
    const listSelector = channelTypeHeading === 'PUBLIC CHANNELS' ? '#publicChannelList' : '#privateChannelList';

    // # Find how many public channels there are and store as origChannelLength
    cy.get(`${listSelector} a.sidebar-item`).its('length').as('origChannelLength');

    // * Verify channel `channelName` exists
    cy.get('#sidebarChannelContainer').should('contain', channel.display_name);

    // * Verify new public channel cannot be created with existing public channel name; see verifyExistingChannelError function
    verifyExistingChannelError(channel.name);

    // # Click on Cancel button to move out of New Channel Modal
    cy.get('#cancelNewChannel').contains('Cancel').click();

    // * Verify new private channel cannot be created with existing public channel name:
    verifyExistingChannelError(channel.name, true);

    // # Click on Cancel button to move out of New Channel Modal
    cy.get('#cancelNewChannel').contains('Cancel').click();

    // * Verify the number of channels is still the same as before (by comparing it to origChannelLenth)
    cy.get('@origChannelLength').then((origChannelLength) => {
        cy.get(`${listSelector} a.sidebar-item`).its('length').should('equal', origChannelLength);
    });
}

/**
 * Create new channel via API
 * @param {String} name Name of the channel. This will be used for both name and display_name
 * @param {Boolean} isPrivate Should the channel be private
 * @returns body of request
 */
function createNewChannel(name, isPrivate = false) {
    const makePrivate = isPrivate ? 'P' : '0';

    return cy.getCurrentTeamId().then((teamId) => {
        return cy.apiCreateChannel(teamId, name, name, makePrivate, 'Let us chat here').
            its('body');
    });
}

describe('Channel', () => {
    beforeEach(() => {
        // Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
    });

    it('Mult14635 Should not create new channel with existing public channel name', () => {
        // # Create a new private channel
        createNewChannel(`unique-public-${Date.now()}`, true).as('channel');
        cy.reload();

        cy.get('@channel').then((channel) => {
            // * Verify new public or private channel cannot be created with existing private channel name:
            channelNameTest('PUBLIC CHANNELS', channel);
        });
    });

    it('Mult14635 Should not create new channel with existing private channel name', () => {
        // # Create a new private channel
        createNewChannel(`unique-private-${Date.now()}`, true).as('channel');
        cy.reload();

        cy.get('@channel').then((channel) => {
            // * Verify new public or private channel cannot be created with existing private channel name:
            channelNameTest('PRIVATE CHANNELS', channel);
        });
    });
});
