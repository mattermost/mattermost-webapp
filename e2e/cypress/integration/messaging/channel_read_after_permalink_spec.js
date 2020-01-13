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

        // # Create new DM channel with user's email
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const userEmailArray = [userResponse.body[1].id, userResponse.body[0].id];

            cy.apiCreateDirectChannel(userEmailArray).then(() => {
                cy.visit('/ad-1/messages/@sysadmin');

                // # Post message to use
                cy.postMessage(message);

                cy.getLastPostId().then((postId) => {
                    // # Wrap it for later use
                    cy.wrap(postId).as('postId');

                    // # check if ... button is visible in last post right side
                    cy.get(`#CENTER_button_${postId}`).should('not.be.visible');

                    // # click on ... button of last post
                    cy.clickPostDotMenu(postId);

                    // spy on function and verify it
                    cy.document().then((doc) => {
                        cy.spy(doc, 'execCommand').as('execCommandSpy');
                    });

                    // # click on permalink option
                    cy.get(`#permalink_${postId}`).should('be.visible').click();

                    // # copy permalink from button
                    cy.get('#linkModalCopyLink').click();

                    // # Copy link url from text area
                    cy.get('#linkModalTextArea').invoke('val').as('linkText');

                    cy.get('@execCommandSpy').should('have.been.calledWith', 'copy');

                    // # close modal dialog
                    cy.get('#linkModalCloseButton').click();
                });
            });
        });

        // # get current team id
        cy.getCurrentTeamId().then((teamId) => {
            const channelName = 'test-message-channel-1';

            // # create public channel to post permalink
            cy.apiCreateChannel(teamId, channelName, channelName, 'O', 'Test channel').then((response) => {
                const testChannel = response.body;

                // # post the message on the channel
                postMessageOnChannel(testChannel);

                // # change user
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

                // # read the message and click the permalink
                clickLink(testChannel);

                // # URL should be address the post
                cy.get('@postId').then((postId) => {
                    cy.url().should('include', `/ad-1/pl/${postId}`);
                });

                // # Channel should still be visible
                cy.get('#publicChannelList', {force: true}).scrollIntoView().should('be.visible').within(() => {
                    cy.get('#sidebarItem_' + testChannel.name).
                        scrollIntoView().
                        should('be.visible').
                        and('have.attr', 'aria-label', `${channelName} public channel`);
                });

                // * check the channel is not under the unread channel list
                cy.get('#unreadsChannelList').find('#sidebarItem_' + testChannel.name).should('not.exist');

                // * check the channel is not marked as unread
                cy.get('#sidebarItem_' + testChannel.name).invoke('attr', 'aria-label').should('not.include', 'unread');
            });
        });
    });
});

function postMessageOnChannel(testChannel) {
    // # click on test public channel
    cy.get('#sidebarItem_' + testChannel.name).click({force: true});
    cy.wait(TIMEOUTS.TINY);

    // # paste link on postlist area and mention the other user
    cy.get('@linkText').then((linkText) => {
        cy.postMessage('@sysadmin ' + linkText);

        // # we add the mentioned user to the channel
        cy.get('#add_channel_member_link').click({force: true});
    });
}

function clickLink(testChannel) {
    // # click on test public channel
    cy.get('#sidebarItem_' + testChannel.name).click({force: true});
    cy.wait(TIMEOUTS.TINY);

    // # since the last message is the system message telling us we joined the channel, we take the one previous
    cy.getNthPostId(1).then((postId) => {
        // # Click on permalink
        cy.get(`#postMessageText_${postId} > p > .markdown__link`).scrollIntoView().click();
    });
}
