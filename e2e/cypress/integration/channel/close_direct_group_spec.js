// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel @channel_settings

// Make sure that the current channel is Town Square and that the
// channel identified by the passed name is no longer in the channel
// sidebar
function verifyChannelWasProperlyClosed(channelName) {
    // * Make sure that we have switched channels
    cy.get('#channelHeaderTitle').should('contain', 'Town Square');

    // * Make sure the old DM no longer exists
    cy.get('#sidebarItem_' + channelName).should('not.exist');
}

describe('Close direct messages', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
    });

    it('Through channel header dropdown menu', () => {
        cy.createAndVisitNewDirectMessageWith('sysadmin').then((channel) => {
            // # Open channel header dropdown menu and click on Close Direct Message
            cy.get('#channelHeaderDropdownIcon').click();
            cy.findByText('Close Direct Message').click();

            verifyChannelWasProperlyClosed(channel.name);
        });
    });

    it('Through x button on channel sidebar item', () => {
        cy.createAndVisitNewDirectMessageWith('sysadmin').then((channel) => {
            // # Click on the x button on the sidebar channel item
            cy.get('#sidebarItem_' + channel.name + '>span.btn-close').click({force: true});

            verifyChannelWasProperlyClosed(channel.name);
        });
    });
});

describe('Close group messages', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
    });

    it('Through channel header dropdown menu', () => {
        cy.createAndVisitNewGroupMessageWith(['sysadmin', 'samuel.tucker']).then((channel) => {
            // # Open channel header dropdown menu and click on Close Direct Message
            cy.get('#channelHeaderDropdownIcon').click();
            cy.findByText('Close Group Message').click();

            verifyChannelWasProperlyClosed(channel.name);
        });
    });

    it('Through x button on channel sidebar item', () => {
        cy.createAndVisitNewGroupMessageWith(['sysadmin', 'samuel.tucker']).then((channel) => {
            // # Click on the x button on the sidebar channel item
            cy.get('#sidebarItem_' + channel.name + '>span.btn-close').click({force: true});

            verifyChannelWasProperlyClosed(channel.name);
        });
    });
});
