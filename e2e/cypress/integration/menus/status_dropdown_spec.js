// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @menu

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Status dropdown menu', () => {
    let user1;
    let user2;
    let testChannelUrl;
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({user, team}) => {
            user1 = user;
            testChannelUrl = `/${team.name}/channels/town-square`;
            cy.visit(testChannelUrl);

            cy.apiCreateUser().then(({user: otherUser}) => {
                user2 = otherUser;
                cy.apiAddUserToTeam(team.id, user2.id);
            });
        });
    });

    afterEach(() => {
        // # Reset user status to online to prevent status modal
        cy.apiUpdateUserStatus('online');

        cy.reload();
    });

    it('Displays default menu when status icon is clicked', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Click status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');
    });

    it('MM-T671 Prompting to set status to online from Away', () => {
        cy.apiLogin(user1);
        cy.visit(testChannelUrl);

        // # Use the status drop-down on your profile pic to go Away
        cy.get('img.Avatar').click();
        cy.findByText('Away').click();

        // * Your status stays offline in your view
        cy.get('.away--icon').should('be.visible');

        // # Log out
        cy.apiLogout();

        // # Log back in
        cy.apiLogin(user1);
        cy.visit(testChannelUrl);

        // # On modal that asks if you want to be set Online, select Yes.
        cy.get('.modal-content').within(() => {
            cy.findByText('Your Status is Set to "Away"').should('be.visible');
            cy.findByText('Yes, set my status to "Online"').click();
        });

        // * Your status is online in your view
        cy.get('.online--icon').should('be.visible');

        // # login in as user2
        cy.apiLogin(user2);
        cy.visit(testChannelUrl);
        openDM(user1.username);

        // * Your status is online in other users' views.
        cy.apiGetUserStatus(`${user1.id}`).then((result) => {
            cy.wrap(result.status.status).should('be.equal', 'online');
        });
    });

    it('MM-T675 offline in RHS', () => {
        cy.apiLogin(user1);

        cy.visit(testChannelUrl);

        // # Reset user status to online to prevent status modal
        cy.apiUpdateUserStatus('online');

        // # make a post so we can open RHS reply thread
        cy.uiPostMessageQuickly('hello');

        // # Open RHS
        cy.clickPostCommentIcon();

        // # post /offline to change status to offline
        cy.postMessageReplyInRHS('/offline');

        // * Your status is offine in your view
        cy.get('.offline--icon').should('be.visible');

        // * System message displays "You are now offline"
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).should('contain', 'You are now offline');
        });
    });

    it('MM-T676 online in RHS', () => {
        cy.visit(testChannelUrl);

        // # make a post so we can open RHS reply thread
        cy.uiPostMessageQuickly('hello');

        // # Open RHS
        cy.clickPostCommentIcon();

        // # post /online to change status to online
        cy.postMessageReplyInRHS('/online');

        // * Your status is online in your view
        cy.get('.online--icon').should('be.visible');

        // * System message displays "You are now online"
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).should('contain', 'You are now online');
        });
    });

    it('MM-T677 text after /<status>', () => {
        cy.visit(testChannelUrl);

        // # post /online with some extra text
        cy.get('#post_textbox').type('/online here\'s some extra text {enter}');

        // * Your status is online in your view
        cy.get('.online--icon').should('be.visible');

        // * System message displays "You are now online"
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).should('contain', 'You are now online').should('not.contain', 'some extra text');
        });
    });

    it('Changes status icon to online when "Online" menu item is selected', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Set user status to away to ensure menu click changes status
        cy.apiUpdateUserStatus('away').then(() => {
            // # Click status menu
            cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

            // # Wait for status menu to transition in
            cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

            cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu #status-menu-online').click();

            cy.get('.MenuWrapper.status-dropdown-menu > .status-wrapper > button.status > span > svg > path.online--icon').should('exist');
        });
    });

    it('Changes status icon to away when "Away" menu item is selected', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Click status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu #status-menu-away').click();

        cy.get('.MenuWrapper.status-dropdown-menu > .status-wrapper > button.status > span > svg > path.away--icon').should('exist');
    });

    it('Changes status icon to do not disturb when "Do Not Disturb" menu item is selected', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Click status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu #status-menu-dnd').click();

        cy.get('.MenuWrapper.status-dropdown-menu > .status-wrapper > button.status > span > svg > path.dnd--icon').should('exist');
    });

    it('Changes status icon to offline when "Offline" menu item is selected', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Click status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

        // # Click "Offline" in menu
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu #status-menu-offline').click();

        // * Check that icon is offline icon
        cy.get('.MenuWrapper.status-dropdown-menu > .status-wrapper > button.status > span > svg.offline--icon').should('exist');
    });
});

const openDM = (username) => {
    cy.get('#addDirectChannel').click();
    cy.get('#selectItems').type(`${username}`);
    cy.wait(TIMEOUTS.ONE_SEC);
    cy.get('#multiSelectList').findByText(`@${username}`).click();
    cy.get('#selectItems').findByText(`${username}`).should('be.visible');
    cy.findByText('Go').click();
};
