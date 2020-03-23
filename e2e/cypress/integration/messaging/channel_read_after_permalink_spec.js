// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    before(() => {
        // # Make sure for second user, unread channels are grouped
        cy.apiLogin('sysadmin');
        cy.apiSaveSidebarSettingPreference();

        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/town-square');
    });

    it('M18713-Channel is removed from Unreads section if user navigates out of it via permalink', () => {
        const message = 'Hello' + Date.now();
        let linkText;
        let permalinkId;

        // # Create new DM channel with user's email
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const userEmailArray = [userResponse.body[1].id, userResponse.body[0].id];

            cy.apiCreateDirectChannel(userEmailArray).then(() => {
                cy.visit('/ad-1/messages/@sysadmin');

                // # Post message to use
                cy.postMessage(message);

                cy.getLastPostId().then((postId) => {
                    permalinkId = postId;

                    // # Check if ... button is visible in last post right side
                    cy.get(`#CENTER_button_${postId}`).should('not.be.visible');

                    // # Click on ... button of last post
                    cy.clickPostDotMenu(postId);

                    // # Click on permalink option
                    cy.get(`#permalink_${postId}`).should('be.visible').click().wait(TIMEOUTS.SMALL);

                    // * Check clipboard contains permalink
                    cy.task('getClipboard').should('contain', `/ad-1/pl/${postId}`).then((text) => {
                        linkText = text;
                    });
                });
            });
        });

        // # Get current team id
        cy.getCurrentTeamId().then((teamId) => {
            const channelName = 'test-message-channel-1';

            // # Create public channel to post permalink
            cy.apiCreateChannel(teamId, channelName, channelName, 'O', 'Test channel').then((response) => {
                const testChannel = response.body;

                // # Post the message on the channel
                postMessageOnChannel(testChannel, linkText);

                // # Change user
                cy.visit('/ad-1/town-square');
                cy.apiLogout();
                cy.apiLogin('sysadmin');
                cy.visit('/ad-1/town-square');

                // # Check Message is in Unread List
                cy.get('#unreadsChannelList').should('be.visible').within(() => {
                    cy.get('#sidebarItem_' + testChannel.name).
                        scrollIntoView().
                        should('be.visible').
                        and('have.attr', 'aria-label', `${channelName} public channel 1 mention`);
                });

                // # Read the message and click the permalink
                clickLink(testChannel);

                // * Check if url include the permalink
                cy.url().should('include', `/ad-1/messages/@user-1/${permalinkId}`);

                // * Check if url redirects back to parent path eventually
                cy.wait(TIMEOUTS.SMALL).url().should('include', '/ad-1/messages/@user-1').and('not.include', `/${permalinkId}`);

                // # Channel should still be visible
                cy.get('#publicChannelList', {force: true}).scrollIntoView().should('be.visible').within(() => {
                    cy.get('#sidebarItem_' + testChannel.name).
                        scrollIntoView().
                        should('be.visible').
                        and('have.attr', 'aria-label', `${channelName} public channel`);
                });

                // * Check the channel is not under the unread channel list
                cy.get('#unreadsChannelList').find('#sidebarItem_' + testChannel.name).should('not.exist');

                // * Check the channel is not marked as unread
                cy.get('#sidebarItem_' + testChannel.name).invoke('attr', 'aria-label').should('not.include', 'unread');
            });
        });
    });
});

function postMessageOnChannel(testChannel, linkText) {
    // # Click on test public channel
    cy.get('#sidebarItem_' + testChannel.name).click({force: true});
    cy.wait(TIMEOUTS.TINY);

    // # Paste link on postlist area and mention the other user
    cy.postMessage('@sysadmin ' + linkText);

    // # We add the mentioned user to the channel
    cy.get('#add_channel_member_link').click({force: true});
}

function clickLink(testChannel) {
    // # Click on test public channel
    cy.get('#sidebarItem_' + testChannel.name).click({force: true});
    cy.wait(TIMEOUTS.TINY);

    // # Since the last message is the system message telling us we joined the channel, we take the one previous
    cy.getNthPostId(1).then((postId) => {
        // # Click on permalink
        cy.get(`#postMessageText_${postId} > p > .markdown__link`).scrollIntoView().click();
    });
}
