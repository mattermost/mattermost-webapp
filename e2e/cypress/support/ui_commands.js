
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

// ***********************************************************
// Read more: https://on.cypress.io/custom-commands
// ***********************************************************

Cypress.Commands.add('logout', () => {
    cy.get('#logout').click({force: true});
});

Cypress.Commands.add('getCurrentUserId', () => {
    return cy.wrap(new Promise((resolve) => {
        cy.getCookie('MMUSERID').then((cookie) => {
            resolve(cookie.value);
        });
    }));
});

// ***********************************************************
// Account Settings Modal
// ***********************************************************

// Go to Account Settings modal
Cypress.Commands.add('toAccountSettingsModal', () => {
    cy.get('#channel_view', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#accountSettings').should('be.visible').click();
    cy.get('#accountSettingsModal').should('be.visible');
});

/**
 * Change the message display setting
 * @param {String} setting - as 'STANDARD' or 'COMPACT'
 */
Cypress.Commands.add('uiChangeMessageDisplaySetting', (setting = 'STANDARD') => {
    const SETTINGS = {STANDARD: '#message_displayFormatA', COMPACT: '#message_displayFormatB'};

    cy.toAccountSettingsModal();
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
    typeCmdOrCtrlInt('#post_textbox');
});

Cypress.Commands.add('typeCmdOrCtrlForEdit', () => {
    typeCmdOrCtrlInt('#edit_textbox');
});

function typeCmdOrCtrlInt(textboxSelector) {
    let cmdOrCtrl;
    if (isMac()) {
        cmdOrCtrl = '{cmd}';
    } else {
        cmdOrCtrl = '{ctrl}';
    }

    cy.get(textboxSelector).type(cmdOrCtrl, {release: false});
}

Cypress.Commands.add('cmdOrCtrlShortcut', {prevSubject: true}, (subject, text) => {
    const cmdOrCtrl = isMac() ? '{cmd}' : '{ctrl}';
    return cy.get(subject).type(`${cmdOrCtrl}${text}`);
});

Cypress.Commands.add('isMac', () => {
    isMac();
});

function isMac() {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

// ***********************************************************
// Post
// ***********************************************************

Cypress.Commands.add('postMessage', (message) => {
    postMessageAndWait('#post_textbox', message);
});

Cypress.Commands.add('postMessageReplyInRHS', (message) => {
    postMessageAndWait('#reply_textbox', message);
});

Cypress.Commands.add('uiPostMessageQuickly', (message) => {
    cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().
        invoke('val', message).wait(TIMEOUTS.HALF_SEC).type(' {backspace}{enter}');
    cy.waitUntil(() => {
        return cy.get('#post_textbox').then((el) => {
            return el[0].textContent === '';
        });
    });
});

function postMessageAndWait(textboxSelector, message) {
    cy.get(textboxSelector, {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type(`${message}{enter}`).wait(TIMEOUTS.HALF_SEC);
    cy.waitUntil(() => {
        return cy.get(textboxSelector).then((el) => {
            return el[0].textContent === '';
        });
    });
}

function waitUntilPermanentPost() {
    cy.get('#postListContent', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    cy.waitUntil(() => cy.findAllByTestId('postView').last().then((el) => !(el[0].id.includes(':'))));
}

Cypress.Commands.add('getLastPost', () => {
    waitUntilPermanentPost();

    cy.findAllByTestId('postView').last();
});

Cypress.Commands.add('getLastPostId', () => {
    waitUntilPermanentPost();

    cy.findAllByTestId('postView').last().should('have.attr', 'id').and('not.include', ':').
        invoke('replace', 'post_', '');
});

/**
 * @see `cy.uiWaitUntilMessagePostedIncludes` at ./ui_commands.d.ts
 */
Cypress.Commands.add('uiWaitUntilMessagePostedIncludes', (message) => {
    const checkFn = () => {
        return cy.getLastPost().then((el) => {
            const postedMessageEl = el.find('.post-message__text')[0];
            return Boolean(postedMessageEl && postedMessageEl.textContent.includes(message));
        });
    };

    // Wait for 5 seconds with 500ms check interval
    const options = {
        timeout: TIMEOUTS.FIVE_SEC,
        interval: TIMEOUTS.HALF_SEC,
        errorMsg: `Expected "${message}" to be in the last message posted but not found.`,
    };

    return cy.waitUntil(checkFn, options);
});

Cypress.Commands.add('getLastPostIdRHS', () => {
    waitUntilPermanentPost();

    cy.get('#rhsPostList > div').last().should('have.attr', 'id').and('not.include', ':').
        invoke('replace', 'rhsPost_', '');
});

/**
* Get post ID based on index of post list
* @param {Integer} index
* zero (0)         : oldest post
* positive number  : from old to latest post
* negative number  : from new to oldest post
*/
Cypress.Commands.add('getNthPostId', (index = 0) => {
    waitUntilPermanentPost();

    cy.findAllByTestId('postView').eq(index).should('have.attr', 'id').and('not.include', ':').
        invoke('replace', 'post_', '');
});

Cypress.Commands.add('uiGetNthPost', (index) => {
    waitUntilPermanentPost();

    cy.findAllByTestId('postView').eq(index);
});

/**
 * Post message from a file instantly post a message in a textbox
 * instead of typing into it which takes longer period of time.
 * @param {String} file - includes path and filename relative to cypress/fixtures
 * @param {String} target - either #post_textbox or #reply_textbox
 */
Cypress.Commands.add('postMessageFromFile', (file, target = '#post_textbox') => {
    cy.fixture(file, 'utf-8').then((text) => {
        cy.get(target).clear().invoke('val', text).wait(TIMEOUTS.HALF_SEC).type(' {backspace}{enter}').should('have.text', '');
    });
});

/**
 * Compares HTML content of a last post against the given file
 * instead of typing into it which takes longer period of time.
 * @param {String} file - includes path and filename relative to cypress/fixtures
 */
Cypress.Commands.add('compareLastPostHTMLContentFromFile', (file, timeout = TIMEOUTS.TEN_SEC) => {
    // * Verify that HTML Content is correct
    cy.getLastPostId().then((postId) => {
        const postMessageTextId = `#postMessageText_${postId}`;

        cy.fixture(file, 'utf-8').then((expectedHtml) => {
            cy.get(postMessageTextId, {timeout}).should('have.html', expectedHtml.replace(/\n$/, ''));
        });
    });
});

// ***********************************************************
// Post header
// ***********************************************************

function clickPostHeaderItem(postId, location, item) {
    let idPrefix;
    switch (location) {
    case 'CENTER':
        idPrefix = 'post';
        break;
    case 'RHS_ROOT':
    case 'RHS_COMMENT':
        idPrefix = 'rhsPost';
        break;
    case 'SEARCH':
        idPrefix = 'searchResult';
        break;

    default:
        idPrefix = 'post';
    }

    if (postId) {
        cy.get(`#${idPrefix}_${postId}`).trigger('mouseover', {force: true});
        cy.wait(TIMEOUTS.HALF_SEC).get(`#${location}_${item}_${postId}`).click({force: true});
    } else {
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${idPrefix}_${lastPostId}`).trigger('mouseover', {force: true});
            cy.wait(TIMEOUTS.HALF_SEC).get(`#${location}_${item}_${lastPostId}`).click({force: true});
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
 * Click save icon by post ID or to most recent post (if post ID is not provided)
 * @param {String} postId - Post ID
 * @param {String} location - as 'CENTER', 'RHS_ROOT', 'RHS_COMMENT', 'SEARCH'
 */
Cypress.Commands.add('clickPostSaveIcon', (postId, location = 'CENTER') => {
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

Cypress.Commands.add('getCurrentTeamId', () => {
    return cy.get('#headerTeamName').invoke('attr', 'data-teamid');
});

Cypress.Commands.add('getCurrentTeamURL', (siteURL) => {
    let path;

    // siteURL can be provided for cases where subpath is being tested
    if (siteURL) {
        path = window.location.href.substring(siteURL.length);
    } else {
        path = window.location.pathname;
    }

    const result = path.split('/', 2);
    return `/${(result[0] ? result[0] : result[1])}`; // sometimes the first element is emply if path starts with '/'
});

Cypress.Commands.add('leaveTeam', () => {
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#sidebarDropdownMenu #leaveTeam').should('be.visible').click();

    // * Check that the "leave team modal" opened up
    cy.get('#leaveTeamModal').should('be.visible');

    // # click on yes
    cy.get('#leaveTeamYes').click();

    // * Check that the "leave team modal" closed
    cy.get('#leaveTeamModal').should('not.exist');
});

// ***********************************************************
// Text Box
// ***********************************************************

Cypress.Commands.add('clearPostTextbox', (channelName = 'town-square') => {
    cy.get(`#sidebarItem_${channelName}`).click({force: true});
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

    cy.get('#message_displayTitle').scrollIntoView().should('be.visible', 'contain', 'Message Display');
    cy.get('#message_displayEdit').should('be.visible', 'contain', 'Edit');

    cy.get('#languagesTitle').scrollIntoView().should('be.visible', 'contain', 'Language');
    cy.get('#languagesEdit').should('be.visible', 'contain', 'Edit');
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
    return cy.get('#channel-header', {timeout: TIMEOUTS.HALF_MIN}).invoke('attr', 'data-channelid');
});

/**
 * Update channel header
 * @param {String} text - Text to set the header to
 */
Cypress.Commands.add('updateChannelHeader', (text) => {
    cy.get('#channelHeaderDropdownIcon').
        should('be.visible').
        click();
    cy.get('.Menu__content').
        should('be.visible').
        find('#channelEditHeader').
        click();
    cy.get('#edit_textbox').
        clear().
        type(text).
        type('{enter}').
        wait(TIMEOUTS.HALF_SEC);
});

/**
 * Archive the current channel.
 */
Cypress.Commands.add('uiArchiveChannel', () => {
    cy.get('#channelHeaderDropdownIcon').click();
    cy.get('#channelArchiveChannel').click();
    cy.get('#deleteChannelModalDeleteButton').click();
});

/**
 * Navigate to system console-PluginManagement from account settings
 */
Cypress.Commands.add('checkRunLDAPSync', () => {
    cy.apiGetLDAPSync().then((response) => {
        var jobs = response.body;
        var currentTime = new Date();

        // # Run LDAP Sync if no job exists (or) last status is an error (or) last run time is more than 1 day old
        if (jobs.length === 0 || jobs[0].status === 'error' || ((currentTime - (new Date(jobs[0].last_activity_at))) > 8640000)) {
            // # Go to system admin LDAP page and run the group sync
            cy.visit('/admin_console/authentication/ldap');

            // # Click on AD/LDAP Synchronize Now button and verify if succesful
            cy.findByText('AD/LDAP Test').click();
            cy.findByText('AD/LDAP Test Successful').should('be.visible');

            // # Click on AD/LDAP Synchronize Now button
            cy.findByText('AD/LDAP Synchronize Now').click().wait(TIMEOUTS.ONE_SEC);

            // * Get the First row
            cy.findByTestId('jobTable').
                find('tbody > tr').
                eq(0).
                as('firstRow');

            // * Wait until first row updates to say Success
            cy.waitUntil(() => {
                return cy.get('@firstRow').then((el) => {
                    return el.find('.status-icon-success').length > 0;
                });
            }
            , {
                timeout: TIMEOUTS.FIVE_MIN,
                interval: TIMEOUTS.TWO_SEC,
                errorMsg: 'AD/LDAP Sync Job did not finish',
            });
        }
    });
});
