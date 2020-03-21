// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';
import * as TIMEOUTS from '../../fixtures/timeouts';

let selectedRowText;
const user1 = users['user-1'];
const user2 = users['user-2'];

function verifyMainMenuModal(modalName, modalId, modalLabel, expectedModalName) {
    cy.get('#headerInfo button').click();
    cy.findByText(modalName).click();
    cy.get(`#${modalId}`).should('have.attr', 'role', 'dialog').and('have.attr', 'aria-labelledby', modalLabel).within(() => {
        cy.get(`#${modalLabel}`).should('be.visible').and('contain', expectedModalName);
        cy.get('.modal-content>.modal-header button.close').should('have.attr', 'aria-label', 'Close').click();
    });
}

function verifyChannelMenuModal(menuItem, modalName, modalLabel) {
    cy.get('#channelHeaderDropdownIcon').click();
    cy.findByText(menuItem).click();

    cy.get(`div[aria-labelledby='${modalLabel}']`).should('have.attr', 'role', 'dialog').within(() => {
        cy.get(`#${modalLabel}`).should('be.visible').and('contain', modalName);
        cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close').click();
    });
}

describe('Verify Accessibility Support in Modals & Dialogs', () => {
    before(() => {
        cy.apiLogin('sysadmin');

        // Visit the Town Square channel
        cy.visit('/ad-1/channels/town-square');
    });

    beforeEach(() => {
        // Visit the Town Square channel
        cy.visit('/ad-1/channels/town-square');
    });

    it('MM-22623 Accessibility Support in Different Modals and Dialog screen', () => {
        // * Verify the aria-label in main menu button
        cy.get('#headerInfo button').should('have.attr', 'aria-label', 'main menu');

        // * Verify the accessibility support in Account Settings Dialog
        verifyMainMenuModal('Account Settings', 'accountSettingsModal', 'accountSettingsModalLabel', 'Account Settings');

        // * Verify the accessibility support in Team Settings Dialog
        verifyMainMenuModal('Team Settings', 'teamSettingsModal', 'teamSettingsModalLabel', 'Team Settings');

        // * Verify the accessibility support in Manage Members Dialog
        verifyMainMenuModal('Manage Members', 'teamMembersModal', 'teamMemberModalLabel', 'eligendi Members');

        cy.visit('/ad-1/channels/off-topic');

        // * Verify the accessibility support in Channel Edit Header Dialog
        verifyChannelMenuModal('Edit Channel Header', 'Edit Header for Off-Topic', 'editChannelHeaderModalLabel');

        // * Verify the accessibility support in Channel Edit Purpose Dialog
        verifyChannelMenuModal('Edit Channel Purpose', 'Edit Purpose for Off-Topic', 'editChannelPurposeModalLabel');

        // * Verify the accessibility support in Rename Channel Dialog
        verifyChannelMenuModal('Rename Channel', 'Rename Channel', 'renameChannelModalLabel');
    });

    it('MM-22623 Accessibility Support in Direct Messages Dialog screen', () => {
        // * Verify the aria-label in create direct message button
        cy.get('#addDirectChannel').should('have.attr', 'aria-label', 'create new direct message').click();

        // * Verify the accessibility support in Direct Messages Dialog`
        cy.get('#moreDmModal').should('have.attr', 'role', 'dialog').and('have.attr', 'aria-labelledby', 'moreDmModalLabel').within(() => {
            cy.get('#moreDmModalLabel').should('be.visible').and('contain', 'Direct Messages');
            cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close');

            // * Verify the accessibility support in search input
            cy.get('#selectItems input').should('have.attr', 'aria-label', 'Search and add members').and('have.attr', 'aria-autocomplete', 'list');

            // # Search for a text and then check up and down arrow
            cy.get('#selectItems input').type('s', {force: true}).wait(500).type('{downarrow}{downarrow}{downarrow}{uparrow}', {force: true});
            cy.get('#multiSelectList').children().eq(2).should('have.class', 'more-modal__row--selected').within(() => {
                cy.get('.more-modal__name').invoke('text').then((user) => {
                    selectedRowText = user.split(' - ')[0].replace('@', '');
                });
            });

            // * Verify if the reader is able to read out the selected row
            cy.get('.filtered-user-list .sr-only').
                should('have.attr', 'aria-live', 'polite').
                and('have.attr', 'aria-atomic', 'true').
                invoke('text').then((text) => {
                    expect(text).equal(selectedRowText);
                });

            // # Search for an invalid text
            cy.get('#selectItems input').type('somethingwhichdoesnotexist', {force: true}).wait(500);

            // * Check if reader can read no results
            cy.get('.multi-select__wrapper').should('have.attr', 'aria-live', 'polite').and('have.text', 'No items found');
        });
    });

    it('MM-22623 Accessibility Support in More Channels Dialog screen', () => {
        // * Verify the aria-label in more public channels button
        cy.get('#sidebarPublicChannelsMore').should('have.attr', 'aria-label', 'more public channels').click();

        // * Verify the accessibility support in More Channels Dialog`
        cy.get('#moreChannelsModal').should('have.attr', 'role', 'dialog').and('have.attr', 'aria-labelledby', 'moreChannelsModalLabel').within(() => {
            cy.get('#moreChannelsModalLabel').should('be.visible').and('contain', 'More Channels');
            cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close');

            // * Verify the accessibility support in search input
            cy.get('#searchChannelsTextbox').should('have.attr', 'placeholder', 'Search channels');

            // # Focus on the Create Channel button and TAB twice
            cy.get('#createNewChannel').focus().tab().tab();

            // * Verify channel name is highlighted and reader reads the channel name and channel description
            cy.get('#moreChannelsList').children().eq(0).as('selectedRow');
            cy.get('@selectedRow').within(() => {
                cy.get('.more-modal__description').invoke('text').then((description) => {
                    cy.get('.more-modal__details button').
                        should('have.class', 'a11y--active a11y--focused').invoke('text').then((channel) => {
                            selectedRowText = channel.toLowerCase() + ', ' + description.toLowerCase();
                            cy.get('.more-modal__details button').should('have.attr', 'aria-label', selectedRowText);
                        });
                });

                // * Press Tab and verify if focus changes to Join button
                cy.focused().tab();
                cy.get('.more-modal__actions button').should('have.class', 'a11y--active a11y--focused');

                // * Verify previous button should no longer be focused
                cy.get('.more-modal__details button').should('not.have.class', 'a11y--active a11y--focused');
            });

            // * Press Tab again and verify if focus changes to next row
            cy.focused().tab();
            cy.get('#moreChannelsList').children().eq(1).as('selectedRow').
                get('.more-modal__details button').
                should('have.class', 'a11y--active a11y--focused');
        });
    });

    it('MM-22623 Accessibility Support in Add New Members to Channel Dialog screen', () => {
        cy.visit('/ad-1/channels/off-topic');

        // # Open Add Members Dialog
        cy.get('#channelHeaderDropdownIcon').click();
        cy.findByText('Add Members').click();

        // * Verify the accessibility support in Add New Members Dialog`
        cy.get('#addUsersToChannelModal').should('have.attr', 'role', 'dialog').and('have.attr', 'aria-labelledby', 'channelInviteModalLabel').within(() => {
            cy.get('#channelInviteModalLabel').should('be.visible').and('contain', 'Add New Members to Off-Topic');
            cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close');

            // * Verify the accessibility support in search input
            cy.get('#selectItems input').should('have.attr', 'aria-label', 'Search and add members').and('have.attr', 'aria-autocomplete', 'list');

            // # Search for a text and then check up and down arrow
            cy.get('#selectItems input').type('s', {force: true}).wait(TIMEOUTS.TINY).type('{downarrow}{downarrow}{downarrow}{uparrow}', {force: true});
            cy.get('#multiSelectList').children().eq(2).should('have.class', 'more-modal__row--selected').within(() => {
                cy.get('.more-modal__name').invoke('text').then((user) => {
                    selectedRowText = user.split(' - ')[0].replace('@', '');
                });
            });

            // * Verify if the reader is able to read out the selected row
            cy.get('.filtered-user-list .sr-only').
                should('have.attr', 'aria-live', 'polite').
                and('have.attr', 'aria-atomic', 'true').
                invoke('text').then((text) => {
                    expect(text).equal(selectedRowText);
                });

            // # Search for an invalid text and check if reader can read no results
            cy.get('#selectItems input').type('somethingwhichdoesnotexist', {force: true}).wait(500);

            // * Check if reader can read no results
            cy.get('.multi-select__wrapper').should('have.attr', 'aria-live', 'polite').and('have.text', 'No items found');
        });
    });

    it('MM-22623 Accessibility Support in Manage Channel Members Dialog screen', () => {
        cy.visit('/ad-1/channels/off-topic');

        // # Adding at least two other users in the channel
        cy.getCurrentChannelId().then((channelId) => {
            cy.apiGetUserByEmail(user1.email).then((res) => {
                const user = res.body;
                cy.apiAddUserToChannel(channelId, user.id);
            });
            cy.apiGetUserByEmail(user2.email).then((res) => {
                const user = res.body;
                cy.apiAddUserToChannel(channelId, user.id);
            });
        });

        // # Open Channel Members Dialog
        cy.get('#channelHeaderDropdownIcon').click();
        cy.findByText('Manage Members').click();

        // * Verify the accessibility support in Manage Members Dialog`
        cy.get('#channelMembersModal').should('have.attr', 'role', 'dialog').and('have.attr', 'aria-labelledby', 'channelMembersModalLabel').within(() => {
            cy.get('#channelMembersModalLabel').should('be.visible').and('contain', 'Off-Topic Members');
            cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close');

            // * Verify the accessibility support in search input
            cy.get('#searchUsersInput').should('have.attr', 'placeholder', 'Search users').focus().type(' {backspace}').wait(TIMEOUTS.TINY).tab({shift: true}).tab().tab();

            // * Verify channel name is highlighted and reader reads the channel name
            cy.get('.more-modal__list>div').children().eq(0).as('selectedRow');
            cy.get('@selectedRow').within(() => {
                cy.get('.more-modal__actions button').
                    should('have.class', 'a11y--active a11y--focused');
                cy.get('.more-modal__name').invoke('text').then((user) => {
                    selectedRowText = user.split(' - ')[0].replace('@', '');
                    cy.get('.more-modal__actions button .sr-only').should('have.text', selectedRowText);
                });
            });

            // * Press Tab again and verify if focus changes to next row
            cy.focused().tab();
            cy.get('.more-modal__list>div').children().eq(1).as('selectedRow').
                get('.more-modal__actions button').
                should('have.class', 'a11y--active a11y--focused');

            // * Verify accessibility support in search total results
            cy.get('#searchableUserListTotal').should('have.attr', 'aria-live', 'polite');
        });
    });
});
