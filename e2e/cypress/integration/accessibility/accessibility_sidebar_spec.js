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

    it('MM-T1470 Verify Tab Support in Channels section', () => {
        // # Create some Public Channels
        Cypress._.times(2, () => {
            cy.apiCreateChannel(testTeam.id, 'public', 'public');
        });

        // # Wait for few seconds
        cy.wait(TIMEOUTS.ONE_SEC);

        // # Press tab to the Add Public Channel button
        cy.get('#headerInfo button').focus().tab().tab();

        // * Verify if the Plus button has focus
        cy.findByRole('button', {name: 'Add Channel Dropdown'}).should('be.focused').and('have.class', 'a11y--active a11y--focused').and('have.css', 'border-radius', '4px').tab();

        // * Verify if focus changes to different channels in Unread section
        cy.get('.SidebarChannel.unread').each((el) => {
            cy.wrap(el).find('.unread-title').should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('not.be.empty');
            cy.focused().tab();
        });

        cy.focused().tab();

        cy.focused().parent().next().find('.SidebarChannel').each((el, i) => {
            if (i === 0) {
                cy.focused().findByText('CHANNELS');
                cy.focused().tab().tab().tab();
            }

            // * Verify if focus changes to different channels in Channels section
            cy.wrap(el).find('.SidebarLink').should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('not.be.empty');
            cy.focused().tab().tab();
        });
    });

    it('MM-T1472 Verify Tab Support in Direct Messages section', () => {
        // # Trigger DM with a user
        cy.uiAddDirectMessage().click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('#saveItems').click();

        // # Trigger DM with couple of users
        cy.uiAddDirectMessage().click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('.more-modal__row.clickable').eq(1).click();
        cy.get('#saveItems').click();

        cy.wait(TIMEOUTS.TWO_SEC);

        // # Press tab to the Create DM button and verify if the Plus button has focus
        cy.uiAddDirectMessage().
            focus().
            tab({shift: true}).tab().
            should('have.class', 'a11y--active a11y--focused').and('have.css', 'border-radius', '4px').
            tab({shift: true}).tab({shift: true});

        cy.focused().parent().next().find('.SidebarChannel').each((el, i) => {
            if (i === 0) {
                cy.focused().findByText('DIRECT MESSAGES');
                cy.focused().tab().tab().tab().tab();
            }

            // * Verify if focus changes to different channels in Direct Messages section
            cy.wrap(el).find('.SidebarLink').should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('not.be.empty');
            cy.focused().tab().tab();
        });
    });

    it('MM-T1473 Verify Tab Support in Unreads section', () => {
        // # Press tab from the Main Menu button
        cy.get('#headerInfo button').focus().tab().tab().tab();

        // * Verify if focus changes to different channels in Unread section
        cy.get('.SidebarChannel.unread').each((el) => {
            cy.wrap(el).find('.unread-title').should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('not.be.empty');
            cy.focused().tab();
        });
    });

    it('MM-T1474 Verify Tab Support in Favorites section', () => {
        // # Mark few channels as Favorites
        markAsFavorite('off-topic');
        markAsFavorite('town-square');

        // # Press tab from the Main Menu button down to all unread channels
        cy.get('#headerInfo button').focus().tab().tab().tab();
        cy.get('.SidebarChannel.unread').each(() => {
            cy.focused().tab().tab();
        });

        // * Verify if focus changes to different channels in Favorite Channels section
        cy.focused().parent().next().find('.SidebarChannel').each((el, i) => {
            if (i === 0) {
                cy.focused().findByText('FAVORITES');
                cy.focused().tab().tab().tab();
            }

            cy.wrap(el).find('.SidebarLink').should('have.class', 'a11y--active a11y--focused').invoke('attr', 'aria-label').should('not.be.empty');
            cy.focused().tab().tab();
        });
    });

    it('MM-T1475 Verify Up & Down Arrow support in Channel Sidebar', () => {
        cy.apiCreateChannel(testTeam.id, 'public', 'Public', 'O');
        cy.apiCreateChannel(testTeam.id, 'private', 'Private', 'P');

        // # Mark few channels as Favorites
        markAsFavorite('off-topic');
        markAsFavorite('town-square');

        // # Press tab from the Main Menu button
        cy.get('#headerInfo button').focus().tab().tab().tab();

        // # Press Down Arrow and then Up Arrow
        cy.get('body').type('{downarrow}{uparrow}');

        // * Verify if Unread Channels section has focus
        cy.uiGetLhsSection('UNREADS').then(beFocused);

        // # Press Down Arrow and check the focus
        cy.get('body').type('{downarrow}');

        // * Verify if Favorite Channels section has focus
        cy.uiGetLhsSection('FAVORITES').then(beFocused);

        // # Press Down Arrow and check the focus
        cy.get('body').type('{downarrow}');

        // * Verify if Public Channels section has focus
        cy.uiGetLhsSection('CHANNELS').then(beFocused);

        // # Press Down Arrow and check the focus
        cy.get('body').type('{downarrow}');

        // * Verify if Direct Messages section has focus
        cy.uiGetLhsSection('DIRECT MESSAGES').then(beFocused);
    });
});

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

function beFocused(el) {
    cy.wrap(el).
        should('have.class', 'a11y__section').
        and('have.class', 'a11y--focused').
        and('have.class', 'a11y--active');
}
