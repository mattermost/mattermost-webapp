// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

// ***********************************************************
// Read more: https://on.cypress.io/custom-commands
// ***********************************************************

Cypress.Commands.add('logout', () => {
    cy.get('#logout').click({force: true});
});

Cypress.Commands.add('toMainChannelView', (username = 'user-1', password) => {
    cy.apiLogin(username, password);
    cy.visit('/');

    cy.get('#post_textbox').should('be.visible');
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
Cypress.Commands.add('toAccountSettingsModal', (username = 'user-1', isLoggedInAlready = false) => {
    if (!isLoggedInAlready) {
        cy.apiLogin(username);
    }

    cy.visit('/');
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
Cypress.Commands.add('changeMessageDisplaySetting', (setting = 'STANDARD') => {
    const SETTINGS = {STANDARD: '#message_displayFormatA', COMPACT: '#message_displayFormatB'};

    cy.toAccountSettingsModal(null, true);
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
    cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).clear().type(message).type('{enter}');
    cy.wait(TIMEOUTS.TINY);
    cy.get('#post_textbox').should('have.value', '');
});

Cypress.Commands.add('postMessageReplyInRHS', (message) => {
    cy.get('#reply_textbox').should('be.visible').clear().type(message).type('{enter}');
    cy.wait(TIMEOUTS.TINY);
});

function waitUntilPermanentPost() {
    cy.get('#postListContent').should('be.visible');
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

/**
 * Post message from a file instantly post a message in a textbox
 * instead of typing into it which takes longer period of time.
 * @param {String} file - includes path and filename relative to cypress/fixtures
 * @param {String} target - either #post_textbox or #reply_textbox
 */
Cypress.Commands.add('postMessageFromFile', (file, target = '#post_textbox') => {
    cy.fixture(file, 'utf-8').then((text) => {
        cy.get(target).clear().invoke('val', text).wait(TIMEOUTS.TINY).type(' {backspace}{enter}').should('have.text', '');
    });
});

/**
 * Compares HTML content of a last post against the given file
 * instead of typing into it which takes longer period of time.
 * @param {String} file - includes path and filename relative to cypress/fixtures
 */
Cypress.Commands.add('compareLastPostHTMLContentFromFile', (file, timeout = TIMEOUTS.MEDIUM) => {
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

Cypress.Commands.add('getCurrentTeamId', () => {
    return cy.get('#headerTeamName').invoke('attr', 'data-teamid');
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
    return cy.get('#channel-header', {timeout: TIMEOUTS.LARGE}).invoke('attr', 'data-channelid');
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
        wait(TIMEOUTS.TINY);
});

/**
 * On default "ad-1" team, create and visit a new channel
 */
Cypress.Commands.add('createAndVisitNewChannel', () => {
    cy.visit('/ad-1/channels/town-square');

    cy.getCurrentTeamId().then((teamId) => {
        cy.apiCreateChannel(teamId, 'channel-test', 'Channel Test').then((res) => {
            const channel = res.body;

            // # Visit the new channel
            cy.visit(`/ad-1/channels/${channel.name}`);

            // * Verify channel's display name
            cy.get('#channelHeaderTitle').should('contain', channel.display_name);

            cy.wrap(channel);
        });
    });
});

// ***********************************************************
// File Upload
// ************************************************************

/**
 * Upload a file on target input given a filename and mime type
 * @param {String} targetInput - Target input to upload a file
 * @param {String} fileName - Filename to upload from the fixture
 * @param {String} mimeType - Mime type of a file
 */
Cypress.Commands.add('fileUpload', (targetInput, fileName = 'mattermost-icon.png', mimeType = 'image/png') => {
    cy.fixture(fileName).then((fileContent) => {
        cy.get(targetInput).upload(
            {fileContent, fileName, mimeType},
            {subjectType: 'input', force: true},
        );
    });
});
/**
 * Upload a file on target input in binary format - 
 * @param {String} Subject - cypress/fixtures/matterMost.tar.gz 
 * @param {String} filePath - cypress/fixtures/matterMost.tar.gz
 * @Param {String} fileType - application/gzip
 */
Cypress.Commands.add('uploadFile2', { prevSubject: true }, (subject, fileName, fileType) => {
    cy.log('Upload process started . FileName:'+fileName);
    cy.readFile(fileName,'binary').then(content => {
        return Cypress.Blob.binaryStringToBlob(content, fileType).then(blob => {
        const el = subject[0];
        const testFile = new File([blob], fileName, {type: fileType});
        const dataTransfer = new DataTransfer();  
        dataTransfer.items.add(testFile);
        el.files = dataTransfer.files;
        cy.wrap(subject).trigger('change', { force: true });
        });
    });
  });
  
  
  

Cypress.Commands.add('inputFileUpload', (targetInput,fileName,mimeType) => {
    cy.readFile(fileName,'binary').then((fileContent) => {
        cy.get(targetInput).upload(
            {fileContent, fileName, mimeType},
            {subjectType: 'input', force: false},
        );
    });

});

/**
 * Search for plugin management in filter container
 */
Cypress.Commands.add('searchForPluginManagementSysConsole', () => {
    cy.get('li.filter-container').find('input#adminSidebarFilter.filter').
        wait(TIMEOUTS.TINY).should('be.visible').type('plugin Management').click();
});

/**
 * Navigate to system console from account settings
 */
Cypress.Commands.add('navigateToSystemConsoleFromAdminSettings',() => {
    cy.get('#lhsHeader').should('be.visible').within(() => {
        // # Click hamburger main menu 
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Dropdown menu should be visible
        cy.get('.dropdown-menu').should('be.visible').within(() => {
            // * Plugin Marketplace button should be visible then click
        cy.get('#systemConsole').should('be.visible').click();
        });
    });
});

/**
 * Enable or disable Plugin in plugin management RHS
 */
Cypress.Commands.add('enableDisablePluginabsPath', (enableDisable) => {
    const locatorName = "enable"+enableDisable;
    cy.get('input[data-testid=${locatorName}]').should('be.visible').click();
});

/**
 * Check if Draw plugin is available
 */
Cypress.Commands.add('drawPluginExist',() => {
    cy.get('a[data-plugin-id="com.mattermost.draw-plugin"]').its('length').should('be.gte', 0);
});

/**
 * Get Enable or Disable Draw Plugin control
 */
Cypress.Commands.add('getDisableEnableDrawPluginControl',() => {
    cy.wait(TIMEOUTS.TINY).get('.padding-top > a[data-plugin-id="com.mattermost.draw-plugin"]');
});

/**
 * Method to enable/Disable/Remove draw plugin 
 */
Cypress.Commands.add('enableDisableDrawPlugin',(status,fileName,fileType) => {
    
    //cy.drawPluginExist();
    //const drawPluginRemoveOption = cy.get('a[data-plugin-id="com.mattermost.draw-plugin"]').findByText('Remove');
    //if (drawPluginRemoveOption != null){
        switch(status){
            case 'Remove': 
                cy.get('span > a[data-plugin-id="com.mattermost.draw-plugin"]').findByText('Remove').click();
                cy.get('#confirmModalButton').should('be.visible').click().wait(TIMEOUTS.TINY);
                break;
            case  'Enable':
                cy.get('input[type=file]').uploadFile2(fileName,fileName,fileType).wait(TIMEOUTS.TINY);
                cy.get('div.form-group > div.col-sm-8 > button.btn.btn-primary').should('be.visible').click().wait(TIMEOUTS.TINY);
                cy.getDisableEnableDrawPluginControl().findByText('Enable').click();
                break;
            case 'Disable':
                cy.getDisableEnableDrawPluginControl().findByText('Disable').click();
                break;
        }
    //}
}); 

/**
 * Method to Switch to Plugin Management - Upload/Disable/Enable Elements
 */
Cypress.Commands.add('switchToPluginManagementEnableDisableDraw',(status,fileName,fileType) => {
    cy.navigateToSystemConsoleFromAdminSettings();  
    cy.searchForPluginManagementSysConsole();
    cy.enableDisableDrawPlugin(status,fileName,fileType);
});
