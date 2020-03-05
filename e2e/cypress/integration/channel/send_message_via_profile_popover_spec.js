// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import TIMEOUTS from '../../fixtures/timeouts';

describe('Profile popover', () => {
    let newUser;
    const message = `Testing ${Date.now()}`;

    before(() => {
        // # Login as "user-1" and visit '/ad-1/channels/town-square
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        // # Update user preferences
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.apiSaveMessageDisplayPreference();

        // # Create new user and have it post a message
        cy.getCurrentTeamId().then((teamId) => {
            cy.createNewUser({}, [teamId]).then((user) => {
                newUser = user;

                cy.visit('/ad-1/channels/town-square');
                cy.getCurrentChannelId().then((currentChannelId) => {
                    cy.postMessageAs({sender: newUser, message, channelId: currentChannelId}).wait(TIMEOUTS.SMALL);
                });
            });
        });
    });

    it('M19908 Send message in profile popover take to DM channel', () => {
        // # Login as "user-1" and visit '/ad-1/channels/town-square
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        cy.waitUntil(() => cy.getLastPost().then((el) => {
            const postedMessageEl = el.find('.post-message__text > p')[0];
            return Boolean(postedMessageEl && postedMessageEl.textContent.includes(message));
        }));

        cy.getLastPostId().then((lastPostId) => {
            // # On default viewport width of 1300
            // # Click profile icon to open profile popover. Click "Send Message" and verify redirects to DM channel
            verifyDMChannelViaSendMessage(lastPostId, '.status-wrapper', newUser);

            // # Click username to open profile popover. Click "Send Message" and verify redirects to DM channel
            verifyDMChannelViaSendMessage(lastPostId, '.user-popover', newUser);

            // # On mobile view
            cy.viewport('iphone-6');

            // # Click profile icon to open profile popover. Click "Send Message" and verify redirects to DM channel
            verifyDMChannelViaSendMessage(lastPostId, '.status-wrapper', newUser);

            // # Click username to open profile popover. Click "Send Message" and verify redirects to DM channel
            verifyDMChannelViaSendMessage(lastPostId, '.user-popover', newUser);
        });
    });
});

function verifyDMChannelViaSendMessage(postId, profileSelector, user) {
    // # Go to default town-square channel
    cy.visit('/ad-1/channels/town-square');

    // # Visit post thread on RHS and verify that RHS is opened
    cy.wait(TIMEOUTS.TINY);
    cy.clickPostCommentIcon(postId);
    cy.get('#rhsContainer').should('be.visible');

    // # Open profile popover with the given selector
    cy.wait(TIMEOUTS.TINY);
    cy.get(`#rhsPost_${postId}`).should('be.visible').within(() => {
        cy.get(profileSelector).should('be.visible').click();
    });

    // * Verify that profile popover is opened
    cy.wait(TIMEOUTS.TINY);
    cy.get('#user-profile-popover').should('be.visible').within(() => {
        // # Click "Send Message" on profile popover
        cy.findByText('Send Message').should('be.visible').click();
    });

    // * Verify that profile popover is closed
    cy.wait(TIMEOUTS.TINY);
    cy.get('#user-profile-popover').should('not.be.visible');

    // * Verify that it redirects into the DM channel and matches channel intro
    cy.get('#channelIntro').should('be.visible').within(() => {
        cy.url().should('include', '/ad-1/messages/@' + user.username);
        cy.get('.channel-intro-profile').
            should('be.visible').
            and('have.text', user.username);
        cy.get('.channel-intro-text').
            should('be.visible').
            and('contain', `This is the start of your direct message history with ${user.nickname}.`).
            and('contain', 'Direct messages and files shared here are not shown to people outside this area.');
    });
}
