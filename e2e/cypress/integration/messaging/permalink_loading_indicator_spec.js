// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Permalink loading indicator', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M18701-Permalink to first post in channel shows endless loading indicator above', () => {
        const dateNow = Date.now();
        const message = 'Hello' + dateNow;
        const privateChannelName = 'test-private-channel-' + dateNow;
        const publicChannelName = 'test-public-channel-' + dateNow;

        // # Get current team id
        cy.getCurrentTeamId().then((teamId) => {
            // # Create private channel to post message
            cy.apiCreateChannel(teamId, privateChannelName, privateChannelName, 'P', 'Test private channel').then((response) => {
                const testPrivateChannel = response.body;

                // # Click on test private channel
                cy.get('#sidebarItem_' + testPrivateChannel.name).click({force: true});

                // # Post message to use
                cy.postMessage(message);

                // # Get last post id from that postlist area
                cy.getLastPostId().then((postId) => {
                    // # Click on ... button of last post
                    cy.clickPostDotMenu(postId);

                    // # Click on permalink option
                    cy.get(`#permalink_${postId}`).click();

                    // # Copy permalink from button
                    cy.get('#linkModalCopyLink').click();

                    // # Copy link url from text area
                    cy.get('#linkModalTextArea').invoke('val').as('linkText');

                    // # Close modal dialog
                    cy.get('#linkModalCloseButton').click();
                });
            });
        });

        // # Get current team id
        cy.getCurrentTeamId().then((teamId) => {
            // # Create public channel to post permalink
            cy.apiCreateChannel(teamId, publicChannelName, publicChannelName, 'O', 'Test public channel').then((response) => {
                const testPublicChannel = response.body;

                // # Click on test public channel
                cy.get('#sidebarItem_' + testPublicChannel.name).click({force: true});

                // # Paste link on postlist area
                cy.get('@linkText').then((linkText) => {
                    cy.postMessage(linkText);

                    // # Get last post id from that postlist area
                    cy.getLastPostId().then((postId) => {
                        // # Click on permalink
                        cy.get(`#postMessageText_${postId} > p > .markdown__link`).scrollIntoView().click();

                        // # Check if url include the permalink
                        cy.url().should('include', linkText);
                    });

                    // # Get last post id from open channel
                    cy.getLastPostId().then((clickedpostid) => {
                        // # Check the sent message
                        cy.get(`#postMessageText_${clickedpostid}`).should('be.visible').and('have.text', message);

                        // # Check the loading spinner does not appear
                        cy.get('#loadingSpinner').should('not.be.visible');
                    });
                });
            });
        });
    });
});
