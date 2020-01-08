// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../fixtures/timeouts';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const allChannels = [];
let testChannel;
let channelDisplayName;

describe('Account Settings > Sidebar > Channel Switcher', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');

        cy.getCurrentTeamId().then((teamId) => {
            for (let i = 0; i < 15; i++) {
                channelDisplayName = `Channel Switcher ${i.toString()}`;
                cy.apiCreateChannel(teamId, 'channel-switcher', channelDisplayName).then((response) => {
                    allChannels.push(response.body);
                });
            }
        }).then(() => {
            testChannel = allChannels[allChannels.length - 1];
        });

        // # Go to Account Settings with "user-1"
        cy.toAccountSettingsModal(null, true);
    });
    after(() => {
        allChannels.forEach((channel) => {
            cy.apiDeleteChannel(channel.id);
        });
    });

    it('should render in min setting view', () => {
        // * Check that the Sidebar tab is loaded
        cy.get('#sidebarButton').should('be.visible');

        // # Click the sidebar tab
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
        // # Click "Edit" to the right of "Channel Switcher"
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
        // # Click the radio button for "Off"
        cy.get('#channelSwitcherSectionOff').click();

        // # Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'Off');

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // * Channel Switcher button should disappear from the bottom of the left-hand-side bar
        cy.get('#sidebarSwitcherButton').should('be.not.visible');
    });

    it('AS12980 Show Channel Switcher button in left-hand-side', () => {
        // # Return to Account Settings modal
        cy.toAccountSettingsModal('user-1', true);

        // * Check that the Sidebar tab is loaded
        cy.get('#sidebarButton').should('be.visible');

        // # Click the sidebar tab
        cy.get('#sidebarButton').click();

        // # Click "Edit" to the right of "Channel Switcher"
        cy.get('#channelSwitcherEdit').click();

        // # Click the radio button for "On"
        cy.get('#channelSwitcherSectionEnabled').click();

        // # Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'On');

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // * Channel Switcher button should appear at the bottom of the left-hand-side bar
        cy.get('#sidebarSwitcherButton').should('be.visible');
    });

    it('set channel switcher setting to On and test on click of sidebar switcher button', () => {
        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to On
        cy.toAccountSettingsModalChannelSwitcher('user-1');

        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // # Click the sidebar switcher button
        cy.get('#sidebarSwitcherButton').click();

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.');

        // # Type channel display name} on Channel switcher input
        cy.get('#quickSwitchInput').type(channelDisplayName);
        cy.wait(TIMEOUTS.TINY);

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // # Press enter
        cy.get('#quickSwitchInput').type('{enter}');

        // * Verify that it redirected into "channel-switcher" as selected channel
        cy.url().should('include', '/ad-1/channels/' + testChannel.name);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayName);
    });

    it('set channel switcher setting to On and test on press of Ctrl/Cmd+K', () => {
        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to On
        cy.toAccountSettingsModalChannelSwitcher('user-1');

        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // # Type CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.');

        // # Type channel display name on Channel switcher input
        cy.get('#quickSwitchInput').type(channelDisplayName);
        cy.wait(TIMEOUTS.TINY);

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // # Press enter
        cy.get('#quickSwitchInput').type('{enter}');

        // * Verify that it redirected into "channel-switcher" as selected channel
        cy.url().should('include', '/ad-1/channels/' + testChannel.name);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayName);

        // * Channel name should be visible in LHS
        cy.get(`#sidebarItem_${testChannel.name}`).should('be.visible');
    });

    it('AS13216 Using CTRL/CMD+K if Channel Switcher is hidden in the LHS', () => {
        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to Off
        cy.toAccountSettingsModalChannelSwitcher('user-1', false);

        // # Type CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        // * Channel switcher should still be accessible
        cy.get('#quickSwitchHint').should('be.visible');

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.');

        // # Type channel display name on Channel switcher input
        cy.get('#quickSwitchInput').type(channelDisplayName);
        cy.wait(TIMEOUTS.TINY);

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // # Press enter
        cy.get('#quickSwitchInput').type('{enter}');

        // * Verify that it redirected into "channel-switcher" as selected channel
        cy.url().should('include', '/ad-1/channels/' + testChannel.name);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayName);

        // * Channel name should be visible in LHS
        cy.get(`#sidebarItem_${testChannel.name}`).should('be.visible');
    });

    it('Cmd/Ctrl+Shift+L closes Channel Switch modal and sets focus to post textbox', () => {
        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.');

        // # Type CTRL/CMD+shift+L
        cy.get('#quickSwitchInput').cmdOrCtrlShortcut('{shift}L');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('not.be.visible');

        // * focus should be on the input box
        cy.get('#post_textbox').should('be.focused');
    });

    it('Cmd/Ctrl+Shift+M closes Channel Switch modal and sets focus to mentions', () => {
        // # patch user info
        cy.apiPatchMe({notify_props: {first_name: 'false', mention_keys: 'user-1'}});

        // # Go to a known team and channel
        cy.visit('/ad-1/channels/town-square');
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.');

        // # Type CTRL/CMD+shift+m
        cy.get('#quickSwitchInput').cmdOrCtrlShortcut('{shift}M');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('not.be.visible');

        // * searchbox should appear
        cy.get('#searchBox').should('have.attr', 'value', 'user-1 @user-1 ');
        cy.get('.sidebar--right__title').should('contain', 'Recent Mentions');
    });
});
