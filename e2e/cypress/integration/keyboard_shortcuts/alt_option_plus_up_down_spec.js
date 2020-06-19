// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod

describe('Keyboard Shortcuts', () => {
    let testTeam;
    let publicChannel;
    let privateChannel;

    before(() => {
        // # Create and login as new user
        // # Create a test team and channel, then visit
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testTeam = team;
            publicChannel = channel;

            cy.apiCreateChannel(testTeam.id, 'private-a', 'Private B', 'P').then((channelResponse) => {
                privateChannel = channelResponse.body;
            });
        });
    });

    const sysadmin = {display_name: 'sysadmin', name: 'sysadmin', type: 'D'};
    const townSquare = {display_name: 'Town Square', name: 'town-square', type: 'O'};
    const offTopic = {display_name: 'Off-Topic', name: 'off-topic', type: 'O'};

    it('Alt/Option + Up', () => {
        cy.visit(`/${testTeam.name}/messages/@sysadmin`);

        // * Verify that the channel is loaded
        cy.get('#channelHeaderTitle').should('contain', 'sysadmin');

        // * Switch to channels by Alt+Up/Down keypress and verify
        verifyChannelSwitch(testTeam.name, privateChannel, sysadmin, '{uparrow}');
        verifyChannelSwitch(testTeam.name, townSquare, privateChannel, '{uparrow}');
        verifyChannelSwitch(testTeam.name, offTopic, townSquare, '{uparrow}');
        verifyChannelSwitch(testTeam.name, publicChannel, offTopic, '{uparrow}');

        // * Should switch to bottom of channel list when current channel is at the very top
        verifyChannelSwitch(testTeam.name, sysadmin, publicChannel, '{uparrow}');
    });

    it('Alt/Option + Down', () => {
        cy.visit(`/${testTeam.name}/channels/${publicChannel.name}`);

        // * Verify that the channel is loaded
        cy.get('#channelHeaderTitle').should('contain', publicChannel.display_name);

        // # Switch to channels by Alt+Up/Down keypress and verify
        verifyChannelSwitch(testTeam.name, offTopic, publicChannel, '{downarrow}');
        verifyChannelSwitch(testTeam.name, townSquare, offTopic, '{downarrow}');
        verifyChannelSwitch(testTeam.name, privateChannel, townSquare, '{downarrow}');
        verifyChannelSwitch(testTeam.name, sysadmin, privateChannel, '{downarrow}');

        // * Should switch to top of channel list when current channel is at the very bottom
        verifyChannelSwitch(testTeam.name, publicChannel, sysadmin, '{downarrow}');
    });
});

function verifyChannelSwitch(teamName, toChannel, fromChannel, arrowKey) {
    // # Type Alt+Up/Down
    cy.get('body').type(`{alt}${arrowKey}`);

    // * Verify that it redirects into expected URL
    if (toChannel.type === 'D') {
        cy.url().should('include', `/${teamName}/messages/@${toChannel.name}`);
    } else {
        cy.url().should('include', `/${teamName}/channels/${toChannel.name}`);
    }

    cy.get('#sidebarChannelContainer').should('be.visible').within(() => {
        // * Verify that the toChannel is active in LHS
        verifyClass(toChannel, 'have.class');

        // * Verify that the fromChannel is not active in LHS
        verifyClass(fromChannel, 'not.have.class');
    });

    function verifyClass(channel, assertion) {
        let label;
        if (channel.type === 'O') {
            label = channel.display_name.toLowerCase() + ' public channel';
        } else if (channel.type === 'P') {
            label = channel.display_name.toLowerCase() + ' private channel';
        } else if (channel.type === 'D') {
            label = channel.display_name.toLowerCase();
        }

        cy.findByLabelText(label).parent().should(assertion, 'active');
    }
}
