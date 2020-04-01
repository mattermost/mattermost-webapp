// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [#] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

function removeCreatePostPermission() {
    cy.apiLogin('sysadmin');
    cy.getRoleByName('channel_user').then((response) => {
        const role = response.body;
        role.permissions = role.permissions.filter((permission) => permission !== 'create_post');
        cy.patchRole(role.id, role);
    });
    cy.apiLogin('user-1');
    cy.visit('/ad-1/channels/town-square');
}

function addCreatePostPermission() {
    cy.apiLogin('sysadmin');
    cy.getRoleByName('channel_user').then((response) => {
        const role = response.body;
        role.permissions.push('create_post');
        cy.patchRole(role.id, role);
    });

    // * Check that the post input is enabled again.
    cy.apiLogin('user-1');
    cy.visit('/ad-1/channels/town-square');
}

function openTheRHS() {
    cy.getLastPostId().then((id) => {
        cy.clickPostCommentIcon(id);
    });
}

describe('Message', () => {
    beforeEach(() => {
        // # Login as user-1
        cy.apiLogin('user-1');

        // # Visit the Town Square channel
        cy.visit('/ad-1/channels/town-square');
    });

    it('MM-21924 Post input is disabled without create_post permission', () => {
        // * Check that the post input is enabled.
        cy.get('#post_textbox').should('be.enabled');

        // # Remove the create_post permission from the channel_user role.
        removeCreatePostPermission();

        // * Check that the post input has been disabled.
        cy.get('#post_textbox').should('be.disabled');

        // # Add the create_post permission to the channel_user role.
        addCreatePostPermission();

        // * Check that the post input is enabled again.
        cy.get('#post_textbox').should('be.enabled');
    });

    it('MM-21924 Comment input is disabled without create_post permission', () => {
        // # Create a post to have a RHS thread to open.
        cy.postMessage('foo');

        // * Check that the comment input is enabled.
        openTheRHS();
        cy.get('#reply_textbox').should('be.enabled');

        // # Remove the create_post permission from the channel_user role.
        removeCreatePostPermission();

        // * Check that the comment input has been disabled.
        openTheRHS();
        cy.get('#reply_textbox').should('be.disabled');

        // # Add the create_post permission to the channel_user role.
        addCreatePostPermission();

        // * Check that the post input is enabled again.
        openTheRHS();
        cy.get('#reply_textbox').should('be.enabled');
    });
});
