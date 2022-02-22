// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @accessibility

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Verify Accessibility Support in Modals & Dialogs', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let selectedRowText;

    before(() => {
        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');

        cy.apiInitSetup({userPrefix: 'user000a'}).then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.apiCreateUser().then(({user: newUser}) => {
                cy.apiAddUserToTeam(testTeam.id, newUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, newUser.id);
                });
            });
        });
    });

    beforeEach(() => {
        // # Login as sysadmin and visit the town-square
        cy.apiAdminLogin();
        cy.visit(`/${testTeam.name}/channels/town-square`);
    });

    it('MM-T1454 Accessibility Support in Different Modals and Dialog screen', () => {
        // * Verify the accessibility support in Profile Dialog
        verifyUserMenuModal('Profile');

        // * Verify the accessibility support in Team Settings Dialog
        verifyMainMenuModal('Team Settings');

        // * Verify the accessibility support in Manage Members Dialog
        verifyMainMenuModal('Manage Members', `${testTeam.display_name} Members`);

        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // * Verify the accessibility support in Channel Edit Header Dialog
        verifyChannelMenuModal('Edit Channel Header', 'Edit Header for Off-Topic');

        // * Verify the accessibility support in Channel Edit Purpose Dialog
        verifyChannelMenuModal('Edit Channel Purpose', 'Edit Purpose for Off-Topic');

        // * Verify the accessibility support in Rename Channel Dialog
        verifyChannelMenuModal('Rename Channel');
    });

    it('MM-T1466 Accessibility Support in Direct Messages Dialog screen', () => {
        // * Verify the aria-label in create direct message button
        cy.uiAddDirectMessage().click();

        // * Verify the accessibility support in Direct Messages Dialog
        cy.findAllByRole('dialog', 'Direct Messages').eq(0).within(() => {
            cy.findByRole('heading', 'Direct Messages');

            // * Verify the accessibility support in search input
            cy.findByRole('textbox', {name: 'Search for people'}).
                should('have.attr', 'aria-autocomplete', 'list');

            // # Search for a text and then check up and down arrow
            cy.findByRole('textbox', {name: 'Search for people'}).
                type('s', {force: true}).
                wait(TIMEOUTS.HALF_SEC).
                type('{downarrow}{downarrow}{downarrow}{uparrow}', {force: true});
            cy.get('#multiSelectList').children().eq(2).should('have.class', 'more-modal__row--selected').within(() => {
                cy.get('.more-modal__name').invoke('text').then((user) => {
                    selectedRowText = user.split(' - ')[0].replace('@', '');
                });

                // * Verify image alt is displayed
                cy.get('img.Avatar').should('have.attr', 'alt', 'user profile image');
            });

            // * Verify if the reader is able to read out the selected row
            cy.get('.filtered-user-list .sr-only').
                should('have.attr', 'aria-live', 'polite').
                and('have.attr', 'aria-atomic', 'true').
                invoke('text').then((text) => {
                    expect(text).equal(selectedRowText);
                });

            // # Search for an invalid text
            const additionalSearchTerm = 'somethingwhichdoesnotexist';
            cy.findByRole('textbox', {name: 'Search for people'}).
                type(additionalSearchTerm, {force: true}).
                wait(TIMEOUTS.HALF_SEC);

            // * Check if reader can read no results
            cy.get('.multi-select__wrapper').should('have.attr', 'aria-live', 'polite').and('have.text', `No results found matching s${additionalSearchTerm}`);
        });
    });

    it('MM-T1467 Accessibility Support in More Channels Dialog screen', () => {
        function getChannelAriaLabel(channel) {
            return channel.display_name.toLowerCase() + ', ' + channel.purpose.toLowerCase();
        }

        // # Create atleast 2 channels
        let otherChannel;
        cy.apiCreateChannel(testTeam.id, 'z_accessibility', 'Z Accessibility', 'O', 'other purpose').then(({channel}) => {
            otherChannel = channel;
        });
        cy.apiCreateChannel(testTeam.id, 'accessibility', 'Accessibility', 'O', 'some purpose').then(({channel}) => {
            cy.apiLogin(testUser).then(() => {
                cy.reload();

                // * Verify the aria-label in more public channels button
                cy.uiBrowseOrCreateChannel('Browse Channels').click();

                // * Verify the accessibility support in More Channels Dialog
                cy.findByRole('dialog', {name: 'More Channels'}).within(() => {
                    cy.findByRole('heading', {name: 'More Channels'});

                    // * Verify the accessibility support in search input
                    cy.findByPlaceholderText('Search channels');

                    cy.waitUntil(() => cy.get('#moreChannelsList').then((el) => {
                        return el[0].children.length === 2;
                    }));

                    // # Focus on the Create Channel button and TAB twice
                    cy.get('#createNewChannel').focus().tab().tab();

                    // * Verify channel name is highlighted and reader reads the channel name and channel description
                    cy.get('#moreChannelsList').children().eq(0).within(() => {
                        const selectedChannel = getChannelAriaLabel(channel);
                        cy.findByLabelText(selectedChannel).should('be.focused');

                        // * Press Tab and verify if focus changes to Join button
                        cy.focused().tab();
                        cy.findByText('Join').parent().should('be.focused');

                        // * Verify previous button should no longer be focused
                        cy.findByLabelText(selectedChannel).should('not.be.focused');
                    });

                    // * Press Tab again and verify if focus changes to next row
                    cy.focused().tab();
                    cy.findByLabelText(getChannelAriaLabel(otherChannel)).should('be.focused');
                });
            });
        });
    });

    it('MM-T1468 Accessibility Support in Add people to Channel Dialog screen', () => {
        // # Add atleast 5 users
        for (let i = 0; i < 5; i++) {
            cy.apiCreateUser().then(({user}) => { // eslint-disable-line
                cy.apiAddUserToTeam(testTeam.id, user.id);
            });
        }

        // # Visit the test channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Open Add Members Dialog
        cy.get('#channelHeaderDropdownIcon').click();
        cy.findByText('Add Members').click();

        // * Verify the accessibility support in Add people Dialog
        cy.findAllByRole('dialog').eq(0).within(() => {
            const modalName = `Add people to ${testChannel.display_name}`;
            cy.findByRole('heading', {name: modalName});

            // * Verify the accessibility support in search input
            cy.findByRole('textbox', {name: 'Search for people'}).
                should('have.attr', 'aria-autocomplete', 'list');

            // # Search for a text and then check up and down arrow
            cy.findByRole('textbox', {name: 'Search for people'}).
                type('u', {force: true}).
                wait(TIMEOUTS.HALF_SEC).
                type('{downarrow}{downarrow}{downarrow}{uparrow}', {force: true});
            cy.get('#multiSelectList').
                children().eq(1).
                should('have.class', 'more-modal__row--selected').
                within(() => {
                    cy.get('.more-modal__name').invoke('text').then((user) => {
                        selectedRowText = user.split(' - ')[0].replace('@', '');
                    });

                    // * Verify image alt is displayed
                    cy.get('img.Avatar').should('have.attr', 'alt', 'user profile image');
                });

            // * Verify if the reader is able to read out the selected row
            cy.get('.filtered-user-list .sr-only').
                should('have.attr', 'aria-live', 'polite').
                and('have.attr', 'aria-atomic', 'true').
                invoke('text').then((text) => {
                    expect(text).equal(selectedRowText);
                });

            // # Search for an invalid text and check if reader can read no results
            cy.findByRole('textbox', {name: 'Search for people'}).
                type('somethingwhichdoesnotexist', {force: true}).
                wait(TIMEOUTS.HALF_SEC);

            // * Check if reader can read no results
            cy.get('.no-channel-message').
                should('be.visible').
                and('contain', 'No results found matching');
        });
    });

    it('MM-T1487 Accessibility Support in Manage Channel Members Dialog screen', () => {
        // # Visit test team and channel
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Open Channel Members Dialog
        cy.get('#channelHeaderDropdownIcon').click();
        cy.findByText('Manage Members').click();

        // * Verify the accessibility support in Manage Members Dialog
        cy.findByRole('dialog', {name: 'Off-Topic Members'}).within(() => {
            cy.findByRole('heading', {name: 'Off-Topic Members'});

            // # Set focus on search input
            cy.findByPlaceholderText('Search users').
                focus().
                type(' {backspace}').
                wait(TIMEOUTS.HALF_SEC).
                tab({shift: true}).tab();
            cy.wait(TIMEOUTS.HALF_SEC);

            // # Press tab and verify focus on first user's profile image
            cy.focused().tab();
            cy.findByAltText('sysadmin profile image').should('be.focused');

            // # Press tab and verify focus on first user's username
            cy.focused().tab();
            cy.focused().should('have.text', '@sysadmin');

            // # Press tab and verify focus on second user's profile image
            cy.focused().tab();
            cy.findByAltText(`${testUser.username} profile image`).should('be.focused');

            // # Press tab and verify focus on second user's username
            cy.focused().tab();
            cy.focused().should('have.text', `@${testUser.username}`);

            // # Press tab and verify focus on second user's dropdown option
            cy.focused().tab();
            cy.focused().should('have.class', 'dropdown-toggle').and('contain', 'Channel Member');

            // * Verify accessibility support in search total results
            cy.get('#searchableUserListTotal').should('have.attr', 'aria-live', 'polite');
        });
    });

    it('MM-T1515 Verify Accessibility Support in Invite People Flow', () => {
        // # Open Invite People
        cy.uiGetLHSHeader().click();
        cy.get('#invitePeople').should('be.visible').click();

        // * Verify accessibility support in Invite People Dialog
        cy.get('.InvitationModal').should('have.attr', 'aria-modal', 'true').and('have.attr', 'aria-labelledby', 'invitation_modal_title').and('have.attr', 'role', 'dialog');
        cy.get('#invitation_modal_title').should('be.visible').and('contain.text', 'Invite members to');

        // # Press tab
        cy.get('button.icon-close').focus().tab({shift: true}).tab();

        // * Verify tab focuses on close button
        cy.get('button.icon-close').should('have.attr', 'aria-label', 'Close').and('be.focused');
    });
});

function verifyMainMenuModal(menuItem, modalName) {
    cy.uiGetLHSHeader().click();
    verifyModal(menuItem, modalName);
}

function verifyChannelMenuModal(menuItem, modalName) {
    cy.get('#channelHeaderDropdownIcon').click();
    verifyModal(menuItem, modalName);
}

function verifyUserMenuModal(menuItem) {
    cy.uiGetSetStatusButton().click();
    verifyModal(menuItem);
}

function verifyModal(menuItem, modalName) {
    // * Verify that menu is open
    cy.findByRole('menu');

    // # Click menu item
    cy.findByText(menuItem).click();

    // * Verify the modal
    const name = modalName || menuItem;
    cy.findByRole('dialog', {name}).within(() => {
        cy.findByRole('heading', {name});
        cy.uiClose();
    });
}
