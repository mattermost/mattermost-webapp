// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {testWithConfig} from '../../support/hooks';

import {getRandomInt} from '../../utils';

function shouldRemoveMentionsInRHS(sidebarItemClass) {
    // # Start with a new team
    const teamName = `team-${getRandomInt(999999)}`;
    cy.createNewTeam(teamName, teamName);

    // * Verify that we've switched to the new team
    cy.get('#headerTeamName').should('be.visible').should('be.visible').should('contain', teamName);

    // # Click on Off Topic
    cy.get(`${sidebarItemClass}:contains(Off-Topic)`).should('be.visible').click();

    // * Verify that the channel changed
    cy.url().should('include', `/${teamName}/channels/off-topic`);
    cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Off-Topic');

    let channelId;
    let userId;
    let postId;
    cy.getCurrentChannelId().then((res) => {
        channelId = res;
        return cy.apiGetMe();
    }).then((res) => {
        userId = res.body.id;

        // # Post a unique message with a mention and retrieve its ID
        var messageText = `${Date.now()} - mention to @${res.body.username} `;
        cy.postMessage(messageText);

        return cy.getLastPostId();
    }).then((lastPostId) => {
        postId = lastPostId;

        // # Click on the Recent Mentions button to open the RHS
        cy.get('#channelHeaderMentionButton').click();

        // * Verify that the recently posted message is shown in the RHS
        cy.get(`#rhsPostMessageText_${postId}`).should('exist');

        return cy.removeUserFromChannel(channelId, userId);
    }).then(() => {
        // # Dismiss the modal informing the user they were kicked out
        cy.get('#removedChannelBtn').click();

        // * Verify that the channel changed back to Town Square
        cy.url().should('include', `/${teamName}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // * Verify that Off-Topic has been removed
        cy.get(`${sidebarItemClass}:contains(Off-Topic)`).should('not.exist');

        // * Verify that the recently posted message is no longer in the RHS
        cy.get(`#rhsPostMessageText_${postId}`).should('not.exist');
    });
}

function shouldRemoveFlaggedPostsInRHS(sidebarItemClass) {
    // # Start with a new team
    const teamName = `team-${getRandomInt(999999)}`;
    cy.createNewTeam(teamName, teamName);

    // * Verify that we've switched to the new team
    cy.get('#headerTeamName').should('be.visible').should('be.visible').should('contain', teamName);

    // # Click on Off Topic
    cy.get(`${sidebarItemClass}:contains(Off-Topic)`).should('be.visible').click();

    // * Verify that the channel changed
    cy.url().should('include', `/${teamName}/channels/off-topic`);
    cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Off-Topic');

    let channelId;
    let userId;
    let postId;
    cy.getCurrentChannelId().then((res) => {
        channelId = res;
        return cy.apiGetMe();
    }).then((res) => {
        userId = res.body.id;

        // # Post a unique message and retrieve its ID
        var messageText = `${Date.now()} - post to flag`;
        cy.postMessage(messageText);

        return cy.getLastPostId();
    }).then((lastPostId) => {
        postId = lastPostId;

        // # Flag the last post
        cy.clickPostFlagIcon(postId);

        // # Click on the Flagged Posts button to open the RHS
        cy.get('#channelHeaderFlagButton').click();

        // * Verify that the recently posted message is shown in the RHS
        cy.get(`#rhsPostMessageText_${postId}`).should('exist');

        return cy.removeUserFromChannel(channelId, userId);
    }).then(() => {
        // # Dismiss the modal informing the user they were kicked out
        cy.get('#removedChannelBtn').click();

        // * Verify that the channel changed back to Town Square
        cy.url().should('include', `/${teamName}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // * Verify that Off-Topic has been removed
        cy.get(`${sidebarItemClass}:contains(Off-Topic)`).should('not.exist');

        // * Verify that the recently posted message is no longer in the RHS
        cy.get(`#rhsPostMessageText_${postId}`).should('not.exist');
    });
}

describe('Handle removed user - old sidebar', () => {
    before(() => {
        cy.apiLogin('user-1');

        cy.visit('/');
    });

    it('should be redirected to last channel when a user is removed from their current channel', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('be.visible').should('contain', teamName);

        // # Click on Off Topic
        cy.get('.sidebar-item:contains(Off-Topic)').should('be.visible').click();

        // * Verify that the channel changed
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Off-Topic');

        // # Remove the Guest User from channel
        let channelId;
        cy.getCurrentChannelId().then((res) => {
            channelId = res;
            return cy.apiGetMe();
        }).then((res) => {
            const userId = res.body.id;
            return cy.removeUserFromChannel(channelId, userId);
        }).then(() => {
            // * Verify that the channel changed back to Town Square and that Off-Topic has been removed
            cy.url().should('include', `/${teamName}/channels/town-square`);
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
            cy.get('.sidebar-item:contains(Off-Topic)').should('not.exist');
        });
    });

    it('should remove mentions from RHS', () => {
        shouldRemoveMentionsInRHS('.sidebar-item');
    });

    it('should remove flagged posts from RHS', () => {
        shouldRemoveFlaggedPostsInRHS('.sidebar-item');
    });
});

describe('Handle removed user - new sidebar', () => {
    testWithConfig({
        ServiceSettings: {
            ExperimentalChannelSidebarOrganization: 'default_on',
        },
    });

    before(() => {
        cy.apiLogin('user-1');

        cy.visit('/');
    });

    it('should be redirected to last channel when a user is removed from their current channel', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('be.visible').should('be.visible').should('contain', teamName);

        // # Click on Off Topic
        cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible').click();

        // * Verify that the channel changed
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Off-Topic');

        // # Remove the Guest User from channel
        let channelId;
        cy.getCurrentChannelId().then((res) => {
            channelId = res;
            return cy.apiGetMe();
        }).then((res) => {
            const userId = res.body.id;
            return cy.removeUserFromChannel(channelId, userId);
        }).then(() => {
            // * Verify that the channel changed back to Town Square
            cy.url().should('include', `/${teamName}/channels/town-square`);
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
        });
    });

    it('should remove mentions from RHS', () => {
        shouldRemoveMentionsInRHS('.SidebarChannel');
    });

    it('should remove flagged posts from RHS', () => {
        shouldRemoveFlaggedPostsInRHS('.SidebarChannel');
    });
});
