// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @keyboard_shortcuts

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Keyboard Shortcuts', () => {
    let testUser;
    let otherUser;
    const count = 3;

    const teamAndChannels = [];

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testUser = user;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(team.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, otherUser.id);

                    cy.apiLogin(testUser);

                    Cypress._.times(2, (i) => {
                        cy.apiCreateTeam(`team${i}`, `Team${i}`).then(({team: testTeam}) => {
                            teamAndChannels.push({team: testTeam, channels: []});
                            const channelName = `channel${i}`;
                            const channelDisplayName = `Channel${i}`;

                            Cypress._.times(count, (j) => {
                                cy.apiCreateChannel(testTeam.id, channelName + j, channelDisplayName + j).then(({channel: testChannel}) => {
                                    teamAndChannels[i].channels.push(testChannel);
                                    cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                                        cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('MM-T1241 - CTRL/CMD+K: Unreads', () => {
        const otherUserMention = `@${otherUser.username}`;

        // # Post messages as testUser to first and second team's channels
        Cypress._.forEach(teamAndChannels, (teamAndChannel, i) => {
            cy.visit(`/${teamAndChannel.team.name}/channels/town-square`);

            Cypress._.forEach(teamAndChannel.channels, (channel, j) => {
                cy.get('#sidebarItem_' + channel.name).scrollIntoView().click();
                const message = i === j ? 'without mention' : `mention ${otherUserMention} `;
                cy.postMessage(message);
                cy.uiWaitUntilMessagePostedIncludes(message);
            });
        });

        // # Login as otherUser
        cy.apiLogout();
        cy.apiLogin(otherUser);

        const baseCount = 1;
        const withMention = 1;

        const team1 = teamAndChannels[0].team;
        const team1Channels = teamAndChannels[0].channels;

        // cy.get('@team1').then((team1) => {
        cy.visit(`/${team1.name}/channels/town-square`);

        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // # Verify that the mentions in the channels of this team are displayed
        cy.get('#suggestionList').should('exist').children().should('have.length', count);

        cy.get('#suggestionList').
            findByTestId(team1Channels[0].name).should('be.visible').and('have.class', 'suggestion--selected').
            find('.badge').should('be.visible').and('have.text', baseCount);

        cy.findByRole('textbox', {name: 'quick switch input'}).type('{downarrow}');
        cy.get('#suggestionList').
            findByTestId(team1Channels[1].name).should('be.visible').and('have.class', 'suggestion--selected').
            find('.badge').should('be.visible').and('have.text', baseCount + withMention);

        cy.findByRole('textbox', {name: 'quick switch input'}).type('{downarrow}');
        cy.get('#suggestionList').
            findByTestId(team1Channels[2].name).should('be.visible').and('have.class', 'suggestion--selected').
            find('.badge').should('be.visible').and('have.text', baseCount + withMention);

        cy.findByRole('textbox', {name: 'quick switch input'}).type('{downarrow}');
        cy.findByRole('textbox', {name: 'quick switch input'}).type(team1Channels[1].display_name).wait(TIMEOUTS.HALF_SEC);

        // # Verify that the channels of this team are displayed
        cy.get('#suggestionList').should('be.visible').children().within((el) => {
            cy.wrap(el).should('contain', team1Channels[1].display_name);
        });
    });

    it('MM-T3002 CTRL/CMD+K - Unread Channels and input field focus', () => {
        const team1 = teamAndChannels[0].team;

        // # Visit town square channel by teamUser
        cy.visit(`/${team1.name}/channels/town-square`);

        // # Post message in other channels by otherUser
        teamAndChannels[0].channels.forEach((channel) => {
            cy.postMessageAs({
                sender: otherUser,
                message: `Message on the ${channel.display_name}`,
                channelId: channel.id,
            });
        });

        // # Wait a little for unread channel indicators to show up
        cy.wait(TIMEOUTS.FIVE_SEC);

        // # Press keyboard shortcut for channel switcher
        cy.get('#post_textbox').cmdOrCtrlShortcut('k');

        // * Verify channel switcher shows up
        cy.get('.a11y__modal.channel-switcher').should('exist').and('be.visible').as('channelSwitcherDialog');

        // * Verify the focus is on switchers input field
        cy.focused().should('have.id', 'quickSwitchInput');

        cy.get('@channelSwitcherDialog').within(() => {
            // * Verify all unread channels names are showing up in the dialogs list
            teamAndChannels[0].channels.forEach((channel) => {
                cy.findByText(channel.display_name).should('be.visible');
            });
        });
    });
});
