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
                const message = i === j ? 'without mention' : `mention ${otherUserMention}`;
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

        cy.get('#suggestionList').find('.mentions__name').eq(0).should('be.visible').and('have.class', 'suggestion--selected').and('have.attr', 'aria-label', team1Channels[0].display_name);
        cy.get('#suggestionList').find('.mentions__name').eq(0).within(() => {
            cy.get('.badge').should('be.visible').and('have.text', baseCount);
        });
        cy.findByRole('textbox', {name: 'quick switch input'}).type('{downarrow}');

        cy.get('#suggestionList').find('.mentions__name').eq(1).should('be.visible').and('have.class', 'suggestion--selected').and('have.attr', 'aria-label', team1Channels[1].display_name);
        cy.get('#suggestionList').find('.mentions__name').eq(1).within(() => {
            cy.get('.badge').should('be.visible').and('have.text', baseCount + withMention);
        });
        cy.findByRole('textbox', {name: 'quick switch input'}).type('{downarrow}');

        cy.get('#suggestionList').find('.mentions__name').eq(2).should('be.visible').and('have.class', 'suggestion--selected').and('have.attr', 'aria-label', team1Channels[2].display_name);
        cy.get('#suggestionList').find('.mentions__name').eq(2).within(() => {
            cy.get('.badge').should('be.visible').and('have.text', baseCount + withMention);
        });
        cy.findByRole('textbox', {name: 'quick switch input'}).type('{downarrow}');

        cy.findByRole('textbox', {name: 'quick switch input'}).type(team1Channels[1].display_name).wait(TIMEOUTS.HALF_SEC);

        // # Verify that the channels of this team are displayed
        cy.get('#suggestionList').should('be.visible').children().within((el) => {
            cy.wrap(el).should('contain', team1Channels[1].display_name);
        });
    });
});
