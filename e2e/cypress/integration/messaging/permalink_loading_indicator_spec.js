// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {titleCase} from '../../utils';

describe('Messaging', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M18701-Permalink to first post in channel shows endless loading indicator above', () => {
        const dateNow = Date.now();
        const message = 'Hello' + dateNow;
        const maxMessageCount = 10;
        const privateChannelName = 'test-private-channel-' + dateNow;
        const privateChannelDisplayName = titleCase(privateChannelName.replace(/-/g, ' '));
        const publicChannelName = 'test-public-channel-' + dateNow;
        const publicChannelDisplayName = titleCase(publicChannelName.replace(/-/g, ' '));
        let testPrivateChannel;
        let testPublicChannel;

        // # Get current team id
        cy.getCurrentTeamId().then((teamId) => {
            // # Create private channel to post message
            cy.apiCreateChannel(teamId, privateChannelName, privateChannelDisplayName, 'P', 'Test private channel').then((response) => {
                testPrivateChannel = response.body;

                // # Click on test private channel
                cy.get('#sidebarItem_' + testPrivateChannel.name).click({force: true});

                // # Post several messages
                for (let i = 1; i <= maxMessageCount; i++) {
                    cy.postMessage(`${message}-${i}`);
                }

                // # Get first post id from that postlist area
                cy.getNthPostId(-maxMessageCount).then((postId) => {
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
            cy.apiCreateChannel(teamId, publicChannelName, publicChannelDisplayName, 'O', 'Test public channel').then((response) => {
                testPublicChannel = response.body;

                // # Click on test public channel
                cy.get('#sidebarItem_' + testPublicChannel.name).click({force: true});

                // # Paste link on postlist area
                cy.get('@linkText').then((linkText) => {
                    cy.postMessage(linkText);

                    // # Get last post id from that postlist area
                    cy.getLastPostId().then((postId) => {
                        // # Click on permalink
                        cy.get(`#postMessageText_${postId} > p > .markdown__link`).scrollIntoView().click();

                        // * Check if url include the permalink
                        cy.url().should('include', linkText);

                        // * Check if the matching channel intro title is visible
                        cy.get('#channelIntro').contains('.channel-intro__title', `Beginning of ${testPrivateChannel.display_name}`).should('be.visible');
                    });

                    // # Get last post id from open channel
                    cy.getLastPostId().then((clickedPostId) => {
                        // * Check the sent message
                        cy.get(`#postMessageText_${clickedPostId}`).should('be.visible').and('have.text', `${message}-${maxMessageCount}`);

                        // * Check if the loading indicator is not visible
                        cy.get('.loading-screen').should('not.be.visible');

                        // * Check if the more messages text is not visible
                        cy.get('.more-messages-text').should('not.be.visible');
                    });
                });
            });
        });
    });
});
