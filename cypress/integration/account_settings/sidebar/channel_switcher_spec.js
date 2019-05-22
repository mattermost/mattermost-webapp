// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomInt} from '../../../utils';
import * as TIMEOUTS from '../../../fixtures/timeouts';

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

let testChannel;
const channelDisplayName = `Channel Switcher ${getRandomInt(9999).toString()}`;

describe('Account Settings > Sidebar > Channel Switcher', () => {
    before(() => {
        cy.visit('/');
        cy.getCurrentTeamId().then((teamId) => {
            cy.apiCreateChannel(teamId, 'channel-switcher', channelDisplayName).then((response) => {
                testChannel = response.body;
            });
        });

        // 1. Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');
    });

    after(() => {
        cy.getCurrentChannelId().then((channelId) => {
            cy.apiDeleteChannel(channelId);
        });
    });

    it('should render in min setting view', () => {
        // * Check that the Sidebar tab is loaded
        cy.get('#sidebarButton').should('be.visible');

        // 2. Click the sidebar tab
        cy.get('#sidebarButton').click();

        // * Check that it changed into the Sidebar section
        // * Check the min setting view if each element is present and contains expected text values
        cy.get('#sidebarTitle').should('be.visible').should('contain', 'Sidebar Settings');
        cy.get('#channelSwitcherTitle').should('be.visible').should('contain', 'Channel Switcher');
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'On');
        cy.get('#channelSwitcherEdit').should('be.visible').should('contain', 'Edit');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('should render in max setting view', () => {
        // 3. Click "Edit" to the right of "Channel Switcher"
        cy.get('#channelSwitcherEdit').click();

        // * Check that it changed into the Sidebar section
        // * Check the max setting view if each element is present and contains expected text values
        cy.get('#sidebarTitle').should('be.visible').should('contain', 'Sidebar Settings');
        cy.get('#settingTitle').should('be.visible').should('contain', 'Channel Switcher');
        cy.get('#channelSwitcherRadioOn').should('be.visible').should('contain', 'On');
        cy.get('#channelSwitcherSectionEnabled').should('be.visible');
        cy.get('#channelSwitcherRadioOff').should('be.visible').should('contain', 'Off');
        cy.get('#channelSwitcherSectionOff').should('be.visible');
        cy.get('#channelSwitcherHelpText').should('be.visible').should('contain', 'The channel switcher is shown at the bottom of the sidebar and is used to jump between channels quickly. It can also be accessed using');
        cy.get('#saveSetting').should('be.visible').should('contain', 'Save');
        cy.get('#cancelSetting').should('be.visible').should('contain', 'Cancel');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('AS12980 Hide Channel Switcher button in left-hand-side', () => {
        // 4. Click the radio button for "Off"
        cy.get('#channelSwitcherSectionOff').click();

        // 5. Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'Off');

        // 6. Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // * Channel Switcher button should disappear from the bottom of the left-hand-side bar
        cy.get('#sidebarSwitcherButton').should('be.not.visible');
    });

    it('AS12980 Show Channel Switcher button in left-hand-side', () => {
        // 1. Return to Account Settings modal
        cy.toAccountSettingsModal('user-1', true);

        // * Check that the Sidebar tab is loaded
        cy.get('#sidebarButton').should('be.visible');

        // 2. Click the sidebar tab
        cy.get('#sidebarButton').click();

        // 3. Click "Edit" to the right of "Channel Switcher"
        cy.get('#channelSwitcherEdit').click();

        // 4. Click the radio button for "On"
        cy.get('#channelSwitcherSectionEnabled').click();

        // 5. Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'On');

        // 6. Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // * Channel Switcher button should appear at the bottom of the left-hand-side bar
        cy.get('#sidebarSwitcherButton').should('be.visible');
    });

    it('set channel switcher setting to On and test on click of sidebar switcher button', () => {
        // 1. Go to Account Settings modal > Sidebar > Channel Switcher and set setting to On
        cy.toAccountSettingsModalChannelSwitcher('user-1');

        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // 3. Click the sidebar switcher button
        cy.get('#sidebarSwitcherButton').click();

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.');

        // 4. Type channel display name} on Channel switcher input
        cy.get('#quickSwitchInput').type(channelDisplayName);
        cy.wait(TIMEOUTS.TINY);

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // 5. Press enter
        cy.get('#quickSwitchInput').type('{enter}');

        // * Verify that it redirected into "channel-switcher" as selected channel
        cy.url().should('include', '/ad-1/channels/' + testChannel.name);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayName);
    });

    it('set channel switcher setting to On and test on press of Ctrl/Cmd+K', () => {
        // 1. Go to Account Settings modal > Sidebar > Channel Switcher and set setting to On
        cy.toAccountSettingsModalChannelSwitcher('user-1');

        // 2. Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // 3. Type CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.');

        // 4. Type channel display name on Channel switcher input
        cy.get('#quickSwitchInput').type(channelDisplayName);
        cy.wait(TIMEOUTS.TINY);

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // 5. Press enter
        cy.get('#quickSwitchInput').type('{enter}');

        // * Verify that it redirected into "channel-switcher" as selected channel
        cy.url().should('include', '/ad-1/channels/' + testChannel.name);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayName);
    });

    it('AS13216 Using CTRL/CMD+K if Channel Switcher is hidden in the LHS', () => {
        // 1. Go to Account Settings modal > Sidebar > Channel Switcher and set setting to Off
        cy.toAccountSettingsModalChannelSwitcher('user-1', false);

        // 2. Type CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        // * Channel switcher should still be accessible
        cy.get('#quickSwitchHint').should('be.visible');

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.');

        // 3. Type channel display name on Channel switcher input
        cy.get('#quickSwitchInput').type(channelDisplayName);
        cy.wait(TIMEOUTS.TINY);

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // 4. Press enter
        cy.get('#quickSwitchInput').type('{enter}');

        // * Verify that it redirected into "channel-switcher" as selected channel
        cy.url().should('include', '/ad-1/channels/' + testChannel.name);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayName);
    });
});
