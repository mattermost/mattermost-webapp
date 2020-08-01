// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel_settings

describe('Channel settings', () => {
    let mainUser;
    let otherUser;
    let myTeam;

    // # Ensure a list of channel names that will be alphabetically sorted
    const channelNames = new Array(20).fill(1).map((value, index) => `scroll${index}`);

    before(() => {
        cy.apiInitSetup().then(({team, user: firstUser}) => {
            mainUser = firstUser;
            myTeam = team;

            cy.apiCreateUser().then(({user: secondUser}) => {
                otherUser = secondUser;
                cy.apiAddUserToTeam(team.id, secondUser.id);
            });

            cy.wrap(channelNames).each((name) => {
                const displayName = `channel-${name}`;
                cy.apiCreateChannel(team.id, name, displayName, 'O', '', '', false).then((response) => {
                    const testChannel = response.body;
                    cy.apiAddUserToChannel(testChannel.id, mainUser.id);
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });
        });
    });

    it('MM-T888 Channel sidebar: More unreads', () => {
        // Since channels are
        const firstChannelIndex = 0;
        const lastChannelIndex = channelNames.length - 1;
        cy.visit(`/${myTeam.name}/channels/off-topic`);

        // # Post in first channel, scroll left handside panel in view of last channel
        cy.apiGetChannelByName(myTeam.name, channelNames[firstChannelIndex]).then((response) => {
            const channel = response.body;
            cy.postMessageAs({
                sender: otherUser,
                message: 'Bleep bloop I am a robot',
                channelId: channel.id,
            });
            cy.get(`#sidebarItem_${channelNames[lastChannelIndex]}`).scrollIntoView();
        });

        // * "More Unreads" pill should point to the top
        cy.get('#unreadIndicatorBottom').should('not.be.visible');
        cy.get('#unreadIndicatorTop').should('be.visible').click();

        // # Post in last channel, scroll left handside panel in view of first channel
        cy.apiGetChannelByName(myTeam.name, channelNames[lastChannelIndex]).then((response) => {
            const channel = response.body;
            cy.postMessageAs({
                sender: otherUser,
                message: 'Bleep bloop I am a robot',
                channelId: channel.id,
            });
            cy.get(`#sidebarItem_${channelNames[firstChannelIndex]}`).scrollIntoView();
        });

        // * "More Unreads" pill should point to the top & to the bottom, depending on how we scroll
        cy.get('#unreadIndicatorTop').should('not.be.visible');
        cy.get('#unreadIndicatorBottom').should('be.visible').click();
        cy.get('#unreadIndicatorBottom').should('not.be.visible');
        cy.get('#unreadIndicatorTop').should('be.visible');
    });
});
