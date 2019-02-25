// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../fixtures/users.json';

// ***********************************************************
// Read more: https://on.cypress.io/custom-commands
// ***********************************************************

Cypress.Commands.add('login', (username, {otherUsername, otherPassword, otherURL} = {}) => {
    const user = users[username];
    const usernameParam = user && user.username ? user.username : otherUsername;
    const passwordParam = user && user.password ? user.password : otherPassword;
    const urlParam = otherURL ? `${otherURL}/api/v4/users/login` : '/api/v4/users/login';

    cy.request({
        url: urlParam,
        method: 'POST',
        body: {login_id: usernameParam, password: passwordParam},
    });
});

Cypress.Commands.add('logout', () => {
    cy.get('#logout').click({force: true});
    cy.visit('/');
});

Cypress.Commands.add('logoutByAPI', ({otherURL} = {}) => {
    const urlParam = otherURL ? `${otherURL}/api/v4/users/logout` : '/api/v4/users/logout';

    cy.request({
        url: urlParam,
        method: 'POST',
    });
});

Cypress.Commands.add('toMainChannelView', (username, {otherUsername, otherPassword, otherURL} = {}) => {
    cy.login('user-1', {otherUsername, otherPassword, otherURL});
    cy.visit('/');

    cy.get('#post_textbox').should('be.visible');
});

// ***********************************************************
// Account Settings Modal
// ***********************************************************

// Go to Account Settings modal
Cypress.Commands.add('toAccountSettingsModal', (username, isLoggedInAlready = false, {otherUsername, otherPassword, otherURL} = {}) => {
    if (!isLoggedInAlready) {
        cy.login('user-1', {otherUsername, otherPassword, otherURL});
        cy.visit('/');
    }

    cy.get('#channel_view').should('be.visible');
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#accountSettings').should('be.visible').click();
    cy.get('#accountSettingsModal').should('be.visible');
});

// Go to Account Settings modal > Sidebar > Channel Switcher
Cypress.Commands.add('toAccountSettingsModalChannelSwitcher', (username, setToOn = true) => {
    cy.toAccountSettingsModal(username);

    cy.get('#sidebarButton').should('be.visible');
    cy.get('#sidebarButton').click();

    let isOn;
    cy.get('#channelSwitcherDesc').should((desc) => {
        if (desc.length > 0) {
            isOn = Cypress.$(desc[0]).text() === 'On';
        }
    });

    cy.get('#channelSwitcherEdit').click();

    if (isOn && !setToOn) {
        cy.get('#channelSwitcherSectionOff').click();
    } else if (!isOn && setToOn) {
        cy.get('#channelSwitcherSectionEnabled').click();
    }

    cy.get('#saveSetting').click();
    cy.get('#accountSettingsHeader > .close').click();
});

// ***********************************************************
// Key Press
// ***********************************************************

// Type Cmd or Ctrl depending on OS
Cypress.Commands.add('typeCmdOrCtrl', () => {
    let cmdOrCtrl;
    if (isMac()) {
        cmdOrCtrl = '{cmd}';
    } else {
        cmdOrCtrl = '{ctrl}';
    }

    cy.get('#post_textbox').type(cmdOrCtrl, {release: false});
});

function isMac() {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

// ***********************************************************
// Post
// ***********************************************************

Cypress.Commands.add('postMessage', (message) => {
    cy.get('#post_textbox').type(message).type('{enter}');

    // add wait time to ensure that a post gets posted and not on pending state
    cy.wait(500); // eslint-disable-line
});

Cypress.Commands.add('getLastPost', () => {
    return cy.get('#postListContent').children().last();
});

Cypress.Commands.add('getLastPostId', () => {
    return cy.get('#postListContent').children().last().invoke('attr', 'id').then((divPostId) => {
        return divPostId.replace('post_', '');
    });
});

// ***********************************************************
// Post header
// ***********************************************************

// Click post time at center view
Cypress.Commands.add('clickPostTime', (postId) => {
    if (postId) {
        cy.get(`#post_${postId}`).trigger('mouseover');
        cy.get(`#CENTER_time_${postId}`).click({force: true});
    } else {
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#post_${lastPostId}`).trigger('mouseover');
            cy.get(`#CENTER_time_${lastPostId}`).click({force: true});
        });
    }
});

// Click flag icon by post ID or to most recent post (if post ID is not provided)
Cypress.Commands.add('clickPostFlagIcon', (postId) => {
    if (postId) {
        cy.get(`#post_${postId}`).trigger('mouseover');
        cy.get(`#centerPostFlag_${postId}`).click({force: true});
    } else {
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#post_${lastPostId}`).trigger('mouseover');
            cy.get(`#centerPostFlag_${lastPostId}`).click({force: true});
        });
    }
});

// Click dot menu by post ID or to most recent post (if post ID is not provided)
Cypress.Commands.add('clickPostDotMenu', (postId) => {
    if (postId) {
        cy.get(`#post_${postId}`).trigger('mouseover');
        cy.get(`#CENTER_button_${postId}`).click({force: true});
    } else {
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#post_${lastPostId}`).trigger('mouseover');
            cy.get(`#CENTER_button_${lastPostId}`).click({force: true});
        });
    }
});

// Click post reaction icon at center view
Cypress.Commands.add('clickPostReactionIcon', (postId) => {
    if (postId) {
        cy.get(`#post_${postId}`).trigger('mouseover');
        cy.get(`#CENTER_reaction_${postId}`).click({force: true});
    } else {
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#post_${lastPostId}`).trigger('mouseover');
            cy.get(`#CENTER_reaction_${lastPostId}`).click({force: true});
        });
    }
});

// Click comment icon by post ID or to most recent post (if post ID is not provided)
// This open up the RHS
Cypress.Commands.add('clickPostCommentIcon', (postId) => {
    if (postId) {
        cy.get(`#post_${postId}`).trigger('mouseover');
        cy.get(`#commentIcon_${postId}`).click({force: true});
    } else {
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#post_${lastPostId}`).trigger('mouseover');
            cy.get(`#commentIcon_${lastPostId}`).click({force: true});
        });
    }
});

// Close RHS by clicking close button
Cypress.Commands.add('closeRHS', () => {
    cy.get('#rhsCloseButton').should('be.visible').click();
});

// ***********************************************************
// Teams
// ***********************************************************

Cypress.Commands.add('createNewTeam', (teamName, teamURL) => {
    cy.visit('/create_team');
    cy.get('#teamNameInput').type(teamName).type('{enter}');
    cy.get('#teamURLInput').type(teamURL).type('{enter}');
    cy.visit(`/${teamURL}`);
});

Cypress.Commands.add('removeTeamMember', (teamURL, username) => {
    cy.logout();
    cy.login('sysadmin');
    cy.visit(`/${teamURL}`);
    cy.get('#sidebarHeaderDropdownButton').click();
    cy.get('#manageMembers').click();
    cy.focused().type(username, {force: true});
    cy.get('#removeFromTeam').click({force: true});
    cy.get('.modal-header .close').click();
});
