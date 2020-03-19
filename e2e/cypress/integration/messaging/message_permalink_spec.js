// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Message permalink', () => {
    function ignoreUncaughtException() {
        cy.on('uncaught:exception', (err) => {
            expect(err.message).to.include('Cannot clear timer: timer created');

            return false;
        });
    }

    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
    });

    it('M13675-Copy a permalink and paste into another channel', () => {
        const message = 'Hello' + Date.now();
        const channelName = 'test-message-channel-1';
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
            // # create public channel to post permalink
            cy.apiCreateChannel(teamId, channelName, channelName, 'O', 'Test channel').then((response) => {
                const testChannel = response.body;

                cy.apiSaveMessageDisplayPreference('compact');
                verifyPermalink(message, testChannel, linkText, permalinkId);

                cy.apiSaveMessageDisplayPreference('clean');
                verifyPermalink(message, testChannel, linkText, permalinkId);
            });
        });
    });

    it('Permalink highlight should fade after timeout and change to channel url', () => {
        ignoreUncaughtException();
        const message = 'Hello' + Date.now();

        // # Create new DM channel with user's email
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const userEmailArray = [userResponse.body[1].id, userResponse.body[0].id];

            cy.apiCreateDirectChannel(userEmailArray).then(() => {
                cy.visit('/ad-1/messages/@sysadmin');

                // # Post message to use
                cy.postMessage(message);

                cy.getLastPostId().then((postId) => {
                    cy.visit(`/ad-1/messages/@sysadmin/${postId}`);
                    cy.url().should('include', `/ad-1/messages/@sysadmin/${postId}`);
                    cy.get(`#post_${postId}`).should('have.class', 'post--highlight');
                    cy.clock();
                    cy.tick(6000);
                    cy.get(`#post_${postId}`).should('not.have.class', 'post--highlight');
                    cy.url().should('not.include', postId);
                });
            });
        });
    });
});

function verifyPermalink(message, testChannel, linkText, permalinkId) {
    // # Click on test public channel
    cy.get('#sidebarItem_' + testChannel.name).click({force: true});
    cy.wait(TIMEOUTS.TINY);

    // # Paste link on postlist area
    cy.postMessage(linkText);

    // # Get last post id from that postlist area
    cy.getLastPostId().then((postId) => {
        // # Click on permalink
        cy.get(`#postMessageText_${postId} > p > .markdown__link`).scrollIntoView().click();
        cy.get('div.post-list__dynamic');

        // # Check if url include the permalink
        cy.url().should('include', `/ad-1/messages/@sysadmin/${permalinkId}`);

        // * Check if url redirects back to parent path eventually
        cy.wait(TIMEOUTS.SMALL).url().should('include', '/ad-1/messages/@sysadmin').and('not.include', `/${permalinkId}`);
    });

    // # Get last post id from open channel
    cy.getLastPostId().then((clickedpostid) => {
        // # Check the sent message
        cy.get(`#postMessageText_${clickedpostid}`).should('be.visible').and('have.text', message);
    });
}
