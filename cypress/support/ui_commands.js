// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***********************************************************
// Read more: https://on.cypress.io/custom-commands
// ***********************************************************

Cypress.Commands.add('logout', () => {
    cy.get('#logout').click({force: true});
    cy.visit('/');
});

Cypress.Commands.add('toMainChannelView', (username, {otherUsername, otherPassword, otherURL} = {}) => {
    cy.apiLogin('user-1', {otherUsername, otherPassword, otherURL});
    cy.visit('/');

    cy.get('#post_textbox').should('be.visible');
});

Cypress.Commands.add('selectOption', (select, pos) => {
    cy.get(`${select} option +option`).
        eq(pos).
        then((e) => {
            cy.get(select).
                select(e.val());
        });
});

// Enable Integrations in System Console
Cypress.Commands.add('enableIntegrations', () => {
    cy.get('#channel_view').should('be.visible');
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#systemConsole').should('be.visible').click();
    cy.get('#custom > .sidebar-section > span').click();
    cy.get('#ServiceSettings\\.EnableIncomingWebhookstrue').click();
    cy.get('#ServiceSettings\\.EnableOutgoingWebhookstrue').click();
    cy.get('#ServiceSettings\\.EnableCommandstrue').click();
    cy.get('#ServiceSettings\\.EnableOAuthServiceProvidertrue').click();
    cy.get('#saveSetting').then((btn) => {
        if (btn.is(':disabled')) {
            btn.click();
        }
    });
});

// Go to Integration Settings
Cypress.Commands.add('toIntegrationSettings', () => {
    cy.get('#channel_view').should('be.visible');
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#integrations').should('be.visible').click();
});

Cypress.Commands.add('getSubpath', () => {
    cy.visit('/');
    cy.url().then((url) => {
        cy.location().its('origin').then((origin) => {
            if (url === origin) {
                return '';
            }

            // Remove trailing slash
            return url.replace(origin, '').substring(0, url.length - origin.length - 1);
        });
    });
});

// ***********************************************************
// Account Settings Modal
// ***********************************************************

// Go to Account Settings modal
Cypress.Commands.add('toAccountSettingsModal', (username = 'user-1', isLoggedInAlready = false, {otherUsername, otherPassword, otherURL} = {}) => {
    if (!isLoggedInAlready) {
        cy.apiLogin(username, {otherUsername, otherPassword, otherURL});
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

/**
 * Change the message display setting
 * @param {String} setting - as 'STANDARD' or 'COMPACT'
 * @param {String} username - User to login as
 */
Cypress.Commands.add('changeMessageDisplaySetting', (setting = 'STANDARD', username = 'user-1') => {
    const SETTINGS = {STANDARD: '#message_displayFormatA', COMPACT: '#message_displayFormatB'};

    cy.toAccountSettingsModal(username);
    cy.get('#displayButton').click();

    cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

    cy.get('#message_displayTitle').scrollIntoView();
    cy.get('#message_displayTitle').click();
    cy.get('.section-max').scrollIntoView();

    cy.get(SETTINGS[setting]).check().should('be.checked');

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
    cy.get('#post_textbox').clear().type(message).type('{enter}');
});

Cypress.Commands.add('postMessageReplyInRHS', (message) => {
    cy.get('#reply_textbox').clear().type(message).type('{enter}');
    cy.wait(500); // eslint-disable-line
});

Cypress.Commands.add('getLastPost', () => {
    return cy.get('#postListContent #postContent', {timeout: 30000}).last();
});

Cypress.Commands.add('getLastPostId', (opts = {force: false}) => {
    cy.get('#postListContent #postContent', {timeout: 30000}).last().parent().as('_lastPost');

    if (!opts.force) {
        cy.get('@_lastPost').should('have.attr', 'id').and('not.include', ':');
    }

    return cy.get('@_lastPost').invoke('attr', 'id').then((divPostId) => {
        return divPostId.replace('post_', '');
    });
});

/**
 * Post message from a file instantly post a message in a textbox
 * instead of typing into it which takes longer period of time.
 * @param {String} file - includes path and filename relative to cypress/fixtures
 * @param {String} target - either #post_textbox or #reply_textbox
 */
Cypress.Commands.add('postMessageFromFile', (file, target = '#post_textbox') => {
    cy.fixture(file, 'utf-8').then((text) => {
        cy.get(target).invoke('val', text).wait(500).type(' {backspace}{enter}').should('have.text', '');
    });
});

/**
 * Compares HTML content of a last post against the given file
 * instead of typing into it which takes longer period of time.
 * @param {String} file - includes path and filename relative to cypress/fixtures
 */
Cypress.Commands.add('compareLastPostHTMLContentFromFile', (file) => {
    // * Verify that HTML Content is correct
    cy.getLastPostId().then((postId) => {
        const postMessageTextId = `#postMessageText_${postId}`;

        cy.fixture(file, 'utf-8').then((expectedHtml) => {
            cy.get(postMessageTextId).then((content) => {
                assert.equal(content[0].innerHTML, expectedHtml.replace(/\n$/, ''));
            });
        });
    });
});

// ***********************************************************
// Post header
// ***********************************************************

function clickPostHeaderItem(postId, location, item) {
    if (postId) {
        cy.get(`#post_${postId}`).trigger('mouseover');
        cy.get(`#${location}_${item}_${postId}`).scrollIntoView().click({force: true});
    } else {
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#post_${lastPostId}`).trigger('mouseover');
            cy.get(`#${location}_${item}_${lastPostId}`).scrollIntoView().click({force: true});
        });
    }
}

/**
 * Click post time
 * @param {String} postId - Post ID
 * @param {String} location - as 'CENTER', 'RHS_ROOT', 'RHS_COMMENT', 'SEARCH'
 */
Cypress.Commands.add('clickPostTime', (postId, location = 'CENTER') => {
    clickPostHeaderItem(postId, location, 'time');
});

/**
 * Click flag icon by post ID or to most recent post (if post ID is not provided)
 * @param {String} postId - Post ID
 * @param {String} location - as 'CENTER', 'RHS_ROOT', 'RHS_COMMENT', 'SEARCH'
 */
Cypress.Commands.add('clickPostFlagIcon', (postId, location = 'CENTER') => {
    clickPostHeaderItem(postId, location, 'flagIcon');
});

/**
 * Click dot menu by post ID or to most recent post (if post ID is not provided)
 * @param {String} postId - Post ID
 * @param {String} location - as 'CENTER', 'RHS_ROOT', 'RHS_COMMENT', 'SEARCH'
 */
Cypress.Commands.add('clickPostDotMenu', (postId, location = 'CENTER') => {
    clickPostHeaderItem(postId, location, 'button');
});

/**
 * Click post reaction icon
 * @param {String} postId - Post ID
 * @param {String} location - as 'CENTER', 'RHS_ROOT', 'RHS_COMMENT'
 */
Cypress.Commands.add('clickPostReactionIcon', (postId, location = 'CENTER') => {
    clickPostHeaderItem(postId, location, 'reaction');
});

/**
 * Click comment icon by post ID or to most recent post (if post ID is not provided)
 * This open up the RHS
 * @param {String} postId - Post ID
 * @param {String} location - as 'CENTER', 'SEARCH'
 */
Cypress.Commands.add('clickPostCommentIcon', (postId, location = 'CENTER') => {
    clickPostHeaderItem(postId, location, 'commentIcon');
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
    cy.apiLogout();
    cy.apiLogin('sysadmin');
    cy.visit(`/${teamURL}`);
    cy.get('#sidebarHeaderDropdownButton').click();
    cy.get('#manageMembers').click();
    cy.focused().type(username, {force: true});
    cy.get(`#teamMembersDropdown_${username}`).click();
    cy.get('#removeFromTeam').click();
    cy.get('.modal-header .close').click();
});

Cypress.Commands.add('getCurrentTeamId', () => {
    return cy.get('#headerTeamName').invoke('attr', 'data-teamid');
});

Cypress.Commands.add('leaveTeam', () => {
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#sidebarDropdownMenu #leaveTeam').should('be.visible').click();

    // * Check that the "leave team modal" opened up
    cy.get('#leaveTeamModal').should('be.visible');

    // 4. click on yes
    cy.get('#leaveTeamYes').click();

    // * Check that the "leave team modal" closed
    cy.get('#leaveTeamModal').should('not.be.visible');
});

// ***********************************************************
// Text Box
// ***********************************************************

Cypress.Commands.add('clearPostTextbox', (channelName = 'town-square') => {
    cy.get(`#sidebarItem_${channelName}`).click();
    cy.get('#post_textbox').clear();
});

// ***********************************************************
// Min Setting View
// ************************************************************

// Checking min setting view for display
Cypress.Commands.add('minDisplaySettings', () => {
    cy.get('#themeTitle').should('be.visible', 'contain', 'Theme');
    cy.get('#themeEdit').should('be.visible', 'contain', 'Edit');

    cy.get('#clockTitle').should('be.visible', 'contain', 'Clock Display');
    cy.get('#clockEdit').should('be.visible', 'contain', 'Edit');

    cy.get('#name_formatTitle').should('be.visible', 'contain', 'Teammate Name Display');
    cy.get('#name_formatEdit').should('be.visible', 'contain', 'Edit');

    cy.get('#collapseTitle').should('be.visible', 'contain', 'Default appearance of image previews');
    cy.get('#collapseEdit').should('be.visible', 'contain', 'Edit');

    cy.get('#message_displayTitle').should('be.visible', 'contain', 'Message Display');
    cy.get('#message_displayEdit').should('be.visible', 'contain', 'Edit');

    cy.get('#languagesTitle').scrollIntoView().should('be.visible', 'contain', 'Language');
    cy.get('#languagesEdit').should('be.visible', 'contain', 'Edit');
});

// Selects Edit Theme, selects Custom Theme, checks display, selects custom drop-down for color options
Cypress.Commands.add('customColors', (dropdownInt, dropdownName) => {
    cy.get('#themeEdit').scrollIntoView().click();

    cy.get('#customThemes').click();

    // Checking Custom Theme Display
    cy.get('#displaySettingsTitle').scrollIntoView();
    cy.get('.theme-elements__header').should('be.visible', 'contain', 'Sidebar Styles');
    cy.get('.theme-elements__header').should('be.visible', 'contain', 'Center Channel Styles');
    cy.get('.theme-elements__header').should('be.visible', 'contain', 'Link and BUtton Sytles');
    cy.get('.padding-top').should('be.visible', 'contain', 'Import theme Colors from Slack');
    cy.get('#saveSetting').should('be.visible', 'contain', 'Save');
    cy.get('#cancelSetting').should('be.visible', 'contain', 'Cancel');

    cy.get('.theme-elements__header').eq(dropdownInt).should('contain', dropdownName).click();
});

// Reverts theme color changes to the default Mattermost theme
Cypress.Commands.add('defaultTheme', (username) => {
    cy.toAccountSettingsModal(username);
    cy.get('#displayButton').click();
    cy.get('#themeEdit').click();
    cy.get('#standardThemes').click();
    cy.get('.col-xs-6.col-sm-3.premade-themes').first().click();
    cy.get('#saveSetting').click();
});

// ***********************************************************
// Change User Status
// ************************************************************

// Need to be in main channel view
// 0 = Online
// 1 = Away
// 2 = Do Not Disturb
// 3 = Offline
Cypress.Commands.add('userStatus', (statusInt) => {
    cy.get('.status-wrapper.status-selector').click();
    cy.get('.MenuItem').eq(statusInt).click();
});

// ***********************************************************
// Channel
// ************************************************************

Cypress.Commands.add('getCurrentChannelId', () => {
    return cy.get('#channel-header').invoke('attr', 'data-channelid');
});

/**
 * Update channel header
 * @param {String} text - Text to set the header to
 */
Cypress.Commands.add('updateChannelHeader', (text) => {
    cy.get('#channelHeaderDropdownButton').
        should('be.visible').
        click();
    cy.get('#channelHeaderDropdownMenu').
        should('be.visible').
        find('#channelEditHeader').
        click();
    cy.get('#edit_textbox').
        clear().
        type(text).
        type('{enter}').
        wait(500);
});
