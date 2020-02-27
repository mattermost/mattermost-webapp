// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../fixtures/timeouts';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Sidebar > Channel Switcher', () => {
    let testChannel;
    let testTeam;

    before(() => {
        // # Login and visit "/"
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        // # Create a test team and channels
        cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
            testTeam = response.body;
            cy.visit(`/${testTeam.name}`);
        });

        cy.getCurrentTeamId().then((teamId) => {
            const numberOfChannels = 14;
            Cypress._.forEach(Array(numberOfChannels), (_, index) => {
                cy.apiCreateChannel(teamId, 'channel-switcher', `Channel Switcher ${index.toString()}`).then((response) => {
                    if (index === 0) {
                        testChannel = response.body;
                    }
                });
            });
        });
    });

    after(() => {
        // # Delete the test team as sysadmin
        if (testTeam && testTeam.id) {
            cy.apiLogin('sysadmin');
            cy.apiDeleteTeam(testTeam.id, true);
        }
    });

    it('set channel switcher setting to On and test on click of sidebar switcher button', () => {
        // # Go to a known team and channel
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to On
        enableChannelSwitcher(true);

        // # Click the sidebar switcher button
        cy.get('#sidebarSwitcherButton').click();

        verifyChannelSwitch(testTeam, testChannel);
    });

    it('set channel switcher setting to On and test on press of Ctrl/Cmd+K', () => {
        // # Go to a known team and channel
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to On
        enableChannelSwitcher(true);

        // # Type CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        verifyChannelSwitch(testTeam, testChannel);
    });

    it('AS13216 Using CTRL/CMD+K if Channel Switcher is hidden in the LHS', () => {
        // # Go to a known team and channel
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');

        // # Go to Account Settings modal > Sidebar > Channel Switcher and set setting to Off
        enableChannelSwitcher(false);

        // # Type CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        verifyChannelSwitch(testTeam, testChannel);
    });

    it('Cmd/Ctrl+Shift+L closes Channel Switch modal and sets focus to post textbox', () => {
        // # Go to a known team and channel
        cy.visit(`/${testTeam.name}/channels/town-square`);
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
        cy.visit(`/${testTeam.name}/channels/town-square`);
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

function verifyChannelSwitch(team, channel) {
    // * Channel switcher hint should be visible
    cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.');

    // # Type channel display name on Channel switcher input
    cy.get('#quickSwitchInput').type(channel.display_name);
    cy.wait(TIMEOUTS.TINY);

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

function enableChannelSwitcher(setToOn = true) {
    cy.get('#channel_view').should('be.visible');
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#accountSettings').should('be.visible').click();
    cy.get('#accountSettingsModal').should('be.visible');

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
}
