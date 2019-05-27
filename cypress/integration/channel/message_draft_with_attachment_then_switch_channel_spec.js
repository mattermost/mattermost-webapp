// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

function createNewChannel(name, header, purpose, type) {
    const createChannel = '#create' + type + 'Channel';
    const createChannelName = '#newChannelName';
    const createChannelPurpose = '#newChannelPurpose';
    const createChannelHeader = '#newChannelHeader';

    cy.get(createChannel).click();
    cy.get(createChannelName).type(name);
    cy.get(createChannelPurpose).type(purpose);
    cy.get(createChannelHeader).type(header);

    cy.contains('Create New Channel').click({force: true});
    if (cy.get('#createChannelError')) {
        cy.get('#cancelNewChannel').click();
    }

}

describe('Message Draft with attachment and Switch Channels', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M14126 Message Draft Pencil Icon - No text, only file attachment', () => {
        // # Click on a test channel
        createNewChannel('test-channel-3', 'Test-Channel-3', 'channel created for testing purpose', 'Public');
        cy.get('#sidebarItem_test-channel-3').click({force: true});

        // # Validate if the channel has been opened
        cy.url().should('include', '/channels/test-channel-3');

        // # Validate if the draft icon is not visible on the sidebar before making a draft
        cy.get('#sidebarItem_test-channel- #draftIcon', {force: true}).should('be.not.visible');

        // # Attach image in text area
        cy.fixture('mattermost-icon.png').then((fileContent) => {
            cy.get('#fileUploadButton input').upload(
                {fileContent, fileName: 'mattermost-icon.png', mimeType: 'image/png'},
                {subjectType: 'drag-n-drop'},
            );
        });

        // # Create second test channel
        createNewChannel('test-channel-4', 'Test-Channel-4', 'channel created for testing purpose', 'Public');

        // # Go to test channel without submitting the draft in the previous channel
        cy.get('#sidebarItem_test-channel-4', {force: true}).should('be.visible').click();

        // # Validate if the newly navigated channel is open
        cy.url().should('include', '/channels/test-channel-4');

        // # Validate if the draft icon is visible on side bar on the previous channel with a draft
        cy.get('#sidebarItem_test-channel-3 #draftIcon').should('be.visible');
    });
});
