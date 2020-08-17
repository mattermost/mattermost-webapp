// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Account Settings > Sidebar > Channel Switcher', () => {
    let testUser;
    let testChannel;
    let testTeam;

    before(() => {
        // # Login as test user
        cy.apiInitSetup({loginAfter: true}).then(({team, channel, user}) => {
            testUser = user;
            testChannel = channel;
            testTeam = team;

            // # Create more test channels
            const numberOfChannels = 14;
            Cypress._.forEach(Array(numberOfChannels), (_, index) => {
                cy.apiCreateChannel(testTeam.id, 'channel-switcher', `Channel Switcher ${index.toString()}`);
            });
        });
    });

    beforeEach(() => {
        // # Visit town-square
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
    });

    it('set channel switcher setting to On and test on click of sidebar switcher button', () => {
        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to On
        enableOrDisableChannelSwitcher(true);

        // # Click the sidebar switcher button
        cy.get('#sidebarSwitcherButton').click();

        verifyChannelSwitch(testTeam, testChannel);
    });

    it('set channel switcher setting to On and test on press of Ctrl/Cmd+K', () => {
        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to On
        enableOrDisableChannelSwitcher(true);

        // # Type CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        verifyChannelSwitch(testTeam, testChannel);
    });

    it('MM-T266 Using CTRL/CMD+K if Channel Switcher is hidden in the LHS', () => {
        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to Off
        enableOrDisableChannelSwitcher(false);

        // # Type CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        verifyChannelSwitch(testTeam, testChannel);
    });

    it('Cmd/Ctrl+Shift+L closes Channel Switch modal and sets focus to post textbox', () => {
        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ▲▼ to browse, ENTER to select, ESC to dismiss.');

        // # Type CTRL/CMD+shift+L
        cy.get('#quickSwitchInput').cmdOrCtrlShortcut('{shift}L');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('not.be.visible');

        // * focus should be on the input box
        cy.get('#post_textbox').should('be.focused');
    });

    it('Cmd/Ctrl+Shift+M closes Channel Switch modal and sets focus to mentions', () => {
        // # patch user info
        cy.apiPatchMe({notify_props: {first_name: 'false', mention_keys: testUser.username}});

        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ▲▼ to browse, ENTER to select, ESC to dismiss.');

        // # Type CTRL/CMD+shift+m
        cy.get('#quickSwitchInput').cmdOrCtrlShortcut('{shift}M');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('not.be.visible');

        // * searchbox should appear
        cy.get('#searchBox').should('have.attr', 'value', `${testUser.username} @${testUser.username} `);
        cy.get('.sidebar--right__title').should('contain', 'Recent Mentions');
    });

    it('MM-T305 Changes to Account Settings are not saved when user does not click on Save button', () => {
        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to Off
        enableOrDisableChannelSwitcher(false);

        // # Toggle On Channel Switcher without saving
        toggleOnOrOffChannelSwitcher(true);

        // # Click away from Channel Switcher
        cy.get('#displayButton').click();
        cy.get('#displaySettingsTitle.tab-header').should('have.text', 'Display Settings');
        cy.get('#accountSettingsHeader > .close').click();

        // # Navigate back to Sidebar Settings
        navigateToSidebarSettings();

        // * Verify Channel Switcher is still Off
        cy.get('#channelSwitcherDesc').should('have.text', 'Off');
        cy.get('#accountSettingsHeader > .close').click();
    });
});

function verifyChannelSwitch(team, channel) {
    // * Channel switcher hint should be visible
    cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ▲▼ to browse, ENTER to select, ESC to dismiss.');

    // # Type channel display name on Channel switcher input
    cy.get('#quickSwitchInput').type(channel.display_name);
    cy.wait(TIMEOUTS.HALF_SEC);

    // * Suggestion list should be visible
    cy.get('#suggestionList').should('be.visible');

    // # Press enter
    cy.get('#quickSwitchInput').type('{enter}');

    // * Verify that it redirected into "channel-switcher" as selected channel
    cy.url().should('include', `/${team.name}/channels/${channel.name}`);
    cy.get('#channelHeaderTitle').should('be.visible').should('contain', channel.display_name);

    // * Channel name should be visible in LHS
    cy.get(`#sidebarItem_${channel.name}`).scrollIntoView().should('be.visible');
}

function navigateToSidebarSettings() {
    cy.get('#channel_view').should('be.visible');
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#accountSettings').should('be.visible').click();
    cy.get('#accountSettingsModal').should('be.visible');

    cy.get('#sidebarButton').should('be.visible');
    cy.get('#sidebarButton').click();

    cy.get('#sidebarLi.active').should('be.visible');
    cy.get('#sidebarTitle > .tab-header').should('have.text', 'Sidebar Settings');
}

function toggleOnOrOffChannelSwitcher(toggleOn = true) {
    navigateToSidebarSettings();

    cy.get('#channelSwitcherEdit').click();

    if (toggleOn) {
        cy.get('#channelSwitcherSectionEnabled').click();
    } else {
        cy.get('#channelSwitcherSectionOff').click();
    }
}

function enableOrDisableChannelSwitcher(enable = true) {
    toggleOnOrOffChannelSwitcher(enable);

    cy.get('#saveSetting').click();
    if (enable) {
        cy.get('#channelSwitcherDesc').should('have.text', 'On');
    } else {
        cy.get('#channelSwitcherDesc').should('have.text', 'Off');
    }
    cy.get('#accountSettingsHeader > .close').click();
}
