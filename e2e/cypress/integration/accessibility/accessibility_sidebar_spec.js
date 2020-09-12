// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @accessibility @smoke

import * as TIMEOUTS from '../../fixtures/timeouts';

function markAsFavorite(channelName) {
    // # Visit the channel
    cy.get(`#sidebarItem_${channelName}`).click();
    cy.get('#postListContent').should('be.visible');

    // # Remove from Favorites if already set
    cy.get('#channelHeaderInfo').then((el) => {
        if (el.find('#toggleFavorite.active').length) {
            cy.get('#toggleFavorite').click();
        }
    });

    // # mark it as Favorite
    cy.get('#toggleFavorite').click();
}

describe('Verify Accessibility Support in Channel Sidebar Navigation', () => {
    let testUser;
    let otherUser;
    let testTeam;
    let testChannel;

    before(() => {
        // # Update Configs
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelOrganization: true,
            },
        });

        cy.apiInitSetup().then(({team, channel, user}) => {
            testUser = user;
            testTeam = team;
            testChannel = channel;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id).then(() => {
                        // # Post messages to have unread messages to test user
                        for (let index = 0; index < 5; index++) {
                            cy.postMessageAs({sender: otherUser, message: 'This is an old message', channelId: testChannel.id});
                        }
                    });
                });
            });
        });
    });

    beforeEach(() => {
        // # Login as test user and visit the Town Square channel
        cy.apiLogin(testUser);
        cy.apiSaveSidebarSettingPreference();
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#postListContent').should('be.visible');
    });

    it('MM-T1475 Verify Up & Down Arrow support in Channel Sidebar', () => {
        // # Mark few channels as Favorites
        markAsFavorite('off-topic');
        markAsFavorite('town-square');

        // # Press tab from the Main Menu button
        cy.get('#headerInfo button').focus().tab({shift: true}).tab().tab();

        // # Press Down Arrow and then Up Arrow
        cy.get('body').type('{downarrow}{uparrow}');

        // * Verify if Unread Channels section has focus
        cy.get('#unreadsChannelList').should('have.attr', 'aria-label', 'unreads').and('have.class', 'a11y__section a11y--active a11y--focused');

        // # Press Down Arrow and check the focus
        cy.get('body').type('{downarrow}');

        // * Verify if Favorite Channels section has focus
        cy.get('#favoriteChannelList').should('have.attr', 'aria-label', 'favorite channels').and('have.class', 'a11y__section a11y--active a11y--focused');

        // # Press Down Arrow and check the focus
        cy.get('body').type('{downarrow}');

        // * Verify if Public Channels section has focus
        cy.get('#publicChannelList').should('have.attr', 'aria-label', 'public channels').and('have.class', 'a11y__section a11y--active a11y--focused');

        // # Press Down Arrow and check the focus
        cy.get('body').type('{downarrow}');

        // * Verify if Public Channels section has focus
        cy.get('#privateChannelList').should('have.attr', 'aria-label', 'private channels').and('have.class', 'a11y__section a11y--active a11y--focused');

        // # Press Down Arrow and check the focus
        cy.get('body').type('{downarrow}');

        // * Verify if Public Channels section has focus
        cy.get('#directChannelList').should('have.attr', 'aria-label', 'direct messages').and('have.class', 'a11y__section a11y--active a11y--focused');
    });

    it('MM-T1473 Verify Tab Support in Unreads section', () => {
        // # Press tab from the Main Menu button
        cy.get('#headerInfo button').focus().tab({shift: true}).tab().tab();

        // * Verify if focus changes to different channels in Unread section
        cy.get('#unreadsChannelList .sidebar-item').each((el) => {
            cy.wrap(el).should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('not.be.empty');
            cy.focused().tab();
        });
    });

    it('MM-T1474 Verify Tab Support in Favorites section', () => {
        // # Press tab from the Main Menu button
        cy.get('#headerInfo button').focus().tab({shift: true}).tab().tab();
        cy.get('#unreadsChannelList .sidebar-item').each(() => {
            cy.focused().tab();
        });

        // * Verify if focus changes to different channels in Favorite Channels section
        cy.get('#favoriteChannelList .sidebar-item').each((el) => {
            cy.wrap(el).should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('not.be.empty');
            cy.focused().tab();
        });
    });

    it('MM-T1470 Verify Tab Support in Public Channels section', () => {
        // # Create some Public Channels
        Cypress._.times(2, () => {
            cy.apiCreateChannel(testTeam.id, 'public', 'public');
        });

        // # Wait for few seconds
        cy.wait(TIMEOUTS.FIVE_SEC);

        // # Press tab to the Add Public Channel button
        cy.get('#createPublicChannel').focus().tab({shift: true}).tab().should('have.attr', 'aria-label', 'create a public channel');

        // * Verify if the Plus button is round when it has focus
        cy.get('#createPublicChannel').should('have.class', 'a11y--active a11y--focused').and('have.css', 'border-radius', '50%').tab();

        // * Verify if focus changes to different channels in Public Channels section
        cy.get('#publicChannelList .sidebar-item').each((el) => {
            cy.wrap(el).should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('contain', 'public channel');
            cy.focused().tab();
        });

        // * Verify if focus is on the more public channels
        cy.get('#sidebarPublicChannelsMore').should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'See more public channels');
    });

    it('MM-T1471 Verify Tab Support in Private Channels section', () => {
        // # Create some Private Channels
        Cypress._.times(2, () => {
            cy.apiCreateChannel(testTeam.id, 'private', 'private', 'P');
        });

        // # Wait for few seconds
        cy.wait(TIMEOUTS.FIVE_SEC);

        // # Press tab to the Add Private Channel button
        cy.get('#createPrivateChannel').focus().tab({shift: true}).tab().should('have.attr', 'aria-label', 'create a private channel');

        // * Verify if the Plus button is round when it has focus
        cy.get('#createPrivateChannel').should('have.class', 'a11y--active a11y--focused').and('have.css', 'border-radius', '50%').tab();

        // * Verify if focus changes to different channels in Favorite Channels section
        cy.get('#privateChannelList .sidebar-item').each((el) => {
            cy.wrap(el).should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('contain', 'private channel');
            cy.focused().tab();
        });
    });

    it('MM-T1472 Verify Tab Support in Direct Messages section', () => {
        // # Trigger DM with a user
        cy.get('#addDirectChannel').click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('#saveItems').click();

        // # Trigger DM with couple of users
        cy.get('#addDirectChannel').click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('.more-modal__row.clickable').eq(1).click();
        cy.get('#saveItems').click();

        cy.wait(TIMEOUTS.FIVE_SEC);

        // # Press tab to the Create DM button
        cy.get('#addDirectChannel').focus().tab({shift: true}).tab().should('have.attr', 'aria-label', 'write a direct message');

        // * Verify if the Plus button is round when it has focus
        cy.get('#addDirectChannel').should('have.class', 'a11y--active a11y--focused').and('have.css', 'border-radius', '50%').tab();

        // * Verify if focus changes to different channels in Direct Messages section
        cy.get('#directChannelList .sidebar-item').each((el) => {
            cy.wrap(el).should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('not.be.empty');
            cy.focused().tab();
        });

        // * Verify if focus is on the more direct messages
        cy.get('#moreDirectMessage').should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'See more direct messages');
    });
});
