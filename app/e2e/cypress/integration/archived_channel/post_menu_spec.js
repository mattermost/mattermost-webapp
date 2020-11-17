// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

describe('Archived channels', () => {
    before(() => {
        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        // # Login as test user and visit create channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('MM-T1721 Archive channel posts menu should have copy link and reply options', () => {
        // # Click to add a channel description
        cy.get('#channelHeaderDescription button').click();

        // # Add channel header for system message
        const header = 'this is a header!';
        cy.get('#editChannelHeaderModalLabel').should('be.visible');
        cy.get('textarea#edit_textbox').should('be.visible').type(`${header}{enter}`);

        cy.getLastPostId().then((postId) => {
            // * Check post if it is the system message
            cy.get(`#postMessageText_${postId}`).should('contain', header);
            cy.clickPostDotMenu(postId).then(() => {
                // * Copy link menu item should not be visible
                cy.findByText('Copy Link').should('not.be.visible');

                // * Reply post menu item should not be visible
                cy.findByText('Reply').should('not.be.visible');
            });
        });

        const messageText = 'Test archive channel post menu';

        // # Post a message in the channel
        cy.postMessage(messageText);

        // # Get the last post for reference of ID
        cy.getLastPostId().then((postId) => {
            // # Archive the channel
            cy.uiArchiveChannel();

            // # Click on post dot menu
            cy.clickPostDotMenu(postId);

            // * Copy link menu item should be visible
            cy.findByText('Copy Link').should('be.visible');

            // * Reply post menu item should be visible
            cy.findByText('Reply').should('be.visible');
        });
    });
});
