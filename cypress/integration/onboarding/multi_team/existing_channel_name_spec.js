// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

/**
* Creates a channel with existing name and verify that error is shown
* @param {String} channelTypeID - ID of public or private channel to create
* @param {String} newChannelName - New channel name to assign
*/
function verifyExistingChannelError(channelTypeID, newChannelName) {
    // Click on '+' button for Public or Private Channel
    cy.get(channelTypeID).click();

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
function channelNameTest(channelTypeHeading, channelName) {
    // 1. Find how many public channels there are and store as origChannelLength
    cy.get('#sidebarChannelContainer').children().contains(channelTypeHeading).parent().parent().siblings().its('length').then((origChannelLength) => {
        // * Verify channel `channelName` exists
        cy.get('#sidebarChannelContainer').should('contain', channelName);

        // * Verify new public channel cannot be created with existing public channel name; see verifyExistingChannelError function
        verifyExistingChannelError('#createPublicChannel', channelName);

        // 2. Click on Cancel button to move out of New Channel Modal
        cy.get('#cancelNewChannel').contains('Cancel').click();

        // * Verify new private channel cannot be created with existing public channel name:
        verifyExistingChannelError('#createPrivateChannel', channelName);

        // * Verify the number of channels is still the same as before (by comparing it to origChannelLenth)
        cy.get('#sidebarChannelContainer').children().contains(channelTypeHeading).parent().parent().siblings().its('length').should('eq', origChannelLength);

        // 3. Click on Cancel button to move out of New Channel Modal
        cy.get('#cancelNewChannel').contains('Cancel').click();
    });
}

describe('Channel', () => {
    before(() => {
        // Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M14635 Should not create new channel with existing public channel name', () => {
        // * Verify new public or private channel cannot be created with existing public channel name:
        channelNameTest('PUBLIC CHANNELS', 'Town Square');
    });

    it('M14635 Should not create new channel with existing private channel name', () => {
        // * Verify new public or private channel cannot be created with existing private channel name:
        channelNameTest('PRIVATE CHANNELS', 'commodi');
    });
});
