
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel @channel_settings
import {
    beMuted,
    beUnmuted,
} from '../../support/assertions';

describe('Channel Settings', () => {
    let testTeam;
    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            cy.apiCreateChannel(testTeam.id, 'channel', 'Private Channel', 'P').then(({channel}) => {
                cy.apiAddUserToChannel(channel.id, user.id);
            });

            cy.apiLogin(user);

            // # Visit town-square channel
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('C15052 All channel types have appropriate close button', () => {
        cy.get('#publicChannelList').find('a.sidebar-item').each(($el) => {
            cy.wrap($el).find('span.btn-close').should('not.exist');
        });

        cy.get('#privateChannelList').find('a.sidebar-item').each(($el) => {
            cy.wrap($el).find('span.btn-close').should('not.exist');
        });

        // add a direct message incase there is not one
        cy.get('#addDirectChannel').click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('#saveItems').click();

        // click on all the messages to make sure there are none left unread
        cy.get('#directChannelList').find('a.sidebar-item').each(($el) => {
            cy.wrap($el).as('channel');

            // Click to mark as unread
            cy.get('@channel').click({force: true});

            cy.get('#postListContent').should('be.visible');

            // check for the close button
            cy.get('@channel').find('span.btn-close').should('exist');
        });
    });

    it('MM-T882 Channel URL validation works properly', () => {
        // # Visit off-tipic
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Go to channel dropdown > Rename channel
        cy.get('#channelHeaderDropdownIcon').click();
        cy.findByText('Rename Channel').click();

        // # Try to enter existing URL and save
        cy.get('#channel_name').clear().type('town-square');
        cy.get('#save-button').click();

        // # Error is displayed and URL is unchanged
        cy.get('.has-error').should('be.visible').and('contain', 'Unable to update the channel');
        cy.url().should('include', `/${testTeam.name}/channels/off-topic`);

        // # Enter a new URL and save
        cy.get('#channel_name').clear().type('another-town-square');
        cy.get('#save-button').click();

        // URL is updated and no errors are displayed
        cy.url().should('include', `/${testTeam.name}/channels/another-town-square`);
    });

    it('MM-T887 Channel dropdown menu - Mute / Unmute', () => {
        // # Visit off-topic
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Go to channel dropdown > Mute channel
        cy.get('#channelHeaderDropdownIcon').click();
        cy.findByText('Mute Channel').click();

        // # Verify channel is muted
        cy.get('#sidebarItem_off-topic').should(beMuted);

        // # Verify mute bell icon is visible
        cy.get('#toggleMute').should('be.visible');

        // # Verify that off topic is last in the list of channels
        cy.get('#publicChannelList').children().not('[data-testid="morePublicButton"]').last().should('contain', 'Off-Topic').get('a').should('have.class', 'muted');

        // # Go to channel dropdown > Unmute channel
        cy.get('#channelHeaderDropdownIcon').click();
        cy.findByText('Unmute Channel').click();

        // # Verify channel is unmuted
        cy.get('#sidebarItem_off-topic').should(beUnmuted);

        // # Verify mute bell icon is not visible
        cy.get('#toggleMute').should('not.be.visible');

        // # Verify that off topic is not last in the list of channels
        cy.get('#publicChannelList').children().not('[data-testid="morePublicButton"]').last().should('not.contain', 'Off-Topic');
    });
});
