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

let selectedRowText;

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
    let testTeam;
    let testChannel;
    let testUser;

    before(() => {
        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');

        cy.apiInitSetup().then(({team, channel, user}) => {
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
        // * Verify the aria-label in main menu button
        cy.get('#headerInfo button', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.attr', 'aria-label', 'main menu');

        // * Verify the accessibility support in Account Settings Dialog
        verifyMainMenuModal('Account Settings', 'accountSettingsModal', 'accountSettingsModalLabel', 'Account Settings');

        // * Verify the accessibility support in Team Settings Dialog
        verifyMainMenuModal('Team Settings', 'teamSettingsModal', 'teamSettingsModalLabel', 'Team Settings');

        // * Verify the accessibility support in Manage Members Dialog
        verifyMainMenuModal('Manage Members', 'teamMembersModal', 'teamMemberModalLabel', `${testTeam.display_name} Members`);

        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // * Verify the accessibility support in Channel Edit Header Dialog
        verifyChannelMenuModal('Edit Channel Header', 'Edit Header for Off-Topic', 'editChannelHeaderModalLabel');

        // * Verify the accessibility support in Channel Edit Purpose Dialog
        verifyChannelMenuModal('Edit Channel Purpose', 'Edit Purpose for Off-Topic', 'editChannelPurposeModalLabel');

        // * Verify the accessibility support in Rename Channel Dialog
        verifyChannelMenuModal('Rename Channel', 'Rename Channel', 'renameChannelModalLabel');
    });

    it('MM-T1466 Accessibility Support in Direct Messages Dialog screen', () => {
        // * Verify the aria-label in create direct message button
        cy.get('#addDirectChannel').should('have.attr', 'aria-label', 'write a direct message').click();

        // * Verify the accessibility support in Direct Messages Dialog`
        cy.get('#moreDmModal').should('have.attr', 'role', 'dialog').and('have.attr', 'aria-labelledby', 'moreDmModalLabel').within(() => {
            cy.get('#moreDmModalLabel').should('be.visible').and('contain', 'Direct Messages');
            cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close');

            // * Verify the accessibility support in search input
            cy.get('#selectItems input').should('have.attr', 'aria-label', 'Search and add members').and('have.attr', 'aria-autocomplete', 'list');

            // # Search for a text and then check up and down arrow
            cy.get('#selectItems input').type('s', {force: true}).wait(TIMEOUTS.HALF_SEC).type('{downarrow}{downarrow}{downarrow}{uparrow}', {force: true});
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
            cy.get('#selectItems input').type('somethingwhichdoesnotexist', {force: true}).wait(TIMEOUTS.HALF_SEC);

            // * Check if reader can read no results
            cy.get('.multi-select__wrapper').should('have.attr', 'aria-live', 'polite').and('have.text', 'No items found');
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
                cy.get('#sidebarPublicChannelsMore', {timeout: TIMEOUTS.ONE_MIN}).
                    should('be.visible').
                    and('have.attr', 'aria-label', 'See more public channels').click();

                // * Verify the accessibility support in More Channels Dialog`
                cy.get('#moreChannelsModal').
                    should('be.visible').
                    and('have.attr', 'role', 'dialog').
                    and('have.attr', 'aria-labelledby', 'moreChannelsModalLabel').
                    within(() => {
                        cy.get('#moreChannelsModalLabel').should('be.visible').and('contain', 'More Channels');
                        cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close');

                        // * Verify the accessibility support in search input
                        cy.get('#searchChannelsTextbox').should('have.attr', 'placeholder', 'Search channels');

                        cy.waitUntil(() => cy.get('#moreChannelsList').then((el) => {
                            return el[0].children.length === 2;
                        }));

                        // # Focus on the Create Channel button and TAB twice
                        cy.get('#createNewChannel').focus().tab().tab();

                        // * Verify channel name is highlighted and reader reads the channel name and channel description
                        cy.get('#moreChannelsList').children().eq(0).within(() => {
                            const selectedChannel = getChannelAriaLabel(channel);
                            cy.findByLabelText(selectedChannel).should('have.class', 'a11y--active a11y--focused');

                            // * Press Tab and verify if focus changes to Join button
                            cy.focused().tab();
                            cy.findByText('Join').parent().should('have.class', 'a11y--active a11y--focused');

                            // * Verify previous button should no longer be focused
                            cy.findByLabelText(selectedChannel).should('not.have.class', 'a11y--active a11y--focused');
                        });

                        // * Press Tab again and verify if focus changes to next row
                        cy.focused().tab();
                        cy.findByLabelText(getChannelAriaLabel(otherChannel)).should('have.class', 'a11y--active a11y--focused');
                    });
            });
        });
    });

    it('MM-T1468 Accessibility Support in Add New Members to Channel Dialog screen', () => {
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

        // * Verify the accessibility support in Add New Members Dialog`
        cy.get('#addUsersToChannelModal').should('have.attr', 'role', 'dialog').and('have.attr', 'aria-labelledby', 'channelInviteModalLabel').within(() => {
            cy.get('#channelInviteModalLabel').should('be.visible').and('contain', `Add New Members to ${testChannel.display_name}`);
            cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close');

            // * Verify the accessibility support in search input
            cy.get('#selectItems input').should('have.attr', 'aria-label', 'Search and add members').and('have.attr', 'aria-autocomplete', 'list');

            // # Search for a text and then check up and down arrow
            cy.get('#selectItems input').type('u', {force: true}).wait(TIMEOUTS.HALF_SEC).type('{downarrow}{downarrow}{downarrow}{uparrow}', {force: true});
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

            // # Search for an invalid text and check if reader can read no results
            cy.get('#selectItems input').type('somethingwhichdoesnotexist', {force: true}).wait(TIMEOUTS.HALF_SEC);

            // * Check if reader can read no results
            cy.get('.multi-select__wrapper').should('have.attr', 'aria-live', 'polite').and('have.text', 'No items found');
        });
    });

    it('MM-T1487 Accessibility Support in Manage Channel Members Dialog screen', () => {
        // # Visit test team and channel
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Open Channel Members Dialog
        cy.get('#channelHeaderDropdownIcon').click();
        cy.findByText('Manage Members').click();

        // * Verify the accessibility support in Manage Members Dialog`
        cy.get('#channelMembersModal').should('have.attr', 'role', 'dialog').and('have.attr', 'aria-labelledby', 'channelMembersModalLabel').within(() => {
            cy.get('#channelMembersModalLabel').should('be.visible').and('contain', 'Off-Topic Members');
            cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close');

            // * Verify the accessibility support in search input
            cy.get('#searchUsersInput').should('have.attr', 'placeholder', 'Search users').focus().type(' {backspace}').wait(TIMEOUTS.HALF_SEC).tab({shift: true}).tab().tab().tab();
            cy.wait(TIMEOUTS.HALF_SEC);

            // * Verify channel name is highlighted and reader reads the channel name
            cy.get('.more-modal__list>div').children().eq(1).as('selectedRow');
            cy.get('@selectedRow').within(() => {
                cy.get('button.user-popover').
                    should('have.class', 'a11y--active a11y--focused');
                cy.get('.more-modal__name').invoke('text').then((user) => {
                    selectedRowText = user.split(' ')[0].replace('@', '');
                    cy.get('.more-modal__actions button .sr-only').should('have.text', selectedRowText);

                    // * Verify image alt is displayed
                    cy.get('img.Avatar').should('have.attr', 'alt', `${selectedRowText} profile image`);
                });
            });

            // * Press Tab again and verify if focus changes to next row
            cy.focused().tab();
            cy.get('.more-modal__list>div').children().eq(1).as('selectedRow').
                get('button.dropdown-toggle').
                should('have.class', 'a11y--active a11y--focused');

            // * Verify accessibility support in search total results
            cy.get('#searchableUserListTotal').should('have.attr', 'aria-live', 'polite');
        });
    });

    it('MM-T1515 Verify Accessibility Support in Invite People Flow', () => {
        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // * Verify accessibility support in Invite People Dialog
        cy.get('.FullScreenModal').should('have.attr', 'aria-modal', 'true').and('have.attr', 'aria-labelledby', 'invitation_modal_title').and('have.attr', 'role', 'dialog');
        cy.get('#invitation_modal_title').should('be.visible').and('contain.text', 'Invite people to');

        // * Verify accessibility support in Invite Members option
        cy.findByTestId('inviteMembersLink').should('have.attr', 'aria-labelledby', 'inviteMembersSectionHeader').and('have.attr', 'aria-describedby', 'inviteMembersSectionDescription');
        cy.get('#inviteMembersSectionHeader').should('be.visible').and('have.text', 'Invite Members');
        cy.get('#inviteMembersSectionDescription').should('be.visible').and('have.text', 'Invite new team members with a link or by email. Team members have access to messages and files in open teams and public channels.');

        // * Verify accessibility support in Invite Guests option
        cy.findByTestId('inviteGuestLink').should('have.attr', 'aria-labelledby', 'inviteGuestsSectionHeader').and('have.attr', 'aria-describedby', 'inviteGuestsSectionDescription');
        cy.get('#inviteGuestsSectionHeader').should('be.visible').and('have.text', 'Invite Guests');
        cy.get('#inviteGuestsSectionDescription').should('be.visible').and('have.text', 'Invite guests to one or more channels. Guests only have access to messages, files, and people in the channels they are members of.');

        // # Press tab
        cy.get('button.close-x').focus().tab({shift: true}).tab();

        // * Verify tab focuses on close button
        cy.get('button.close-x').should('have.attr', 'aria-label', 'Close').and('have.class', 'a11y--active a11y--focused').tab();

        // * Verify focus is on the Invite Members option
        cy.findByTestId('inviteMembersLink').should('have.class', 'a11y--active a11y--focused').tab();

        // * Verify focus is on the Invite Guests option
        cy.findByTestId('inviteGuestLink').should('have.class', 'a11y--active a11y--focused').tab();

        // # Click on Invite Members link
        cy.findByTestId('inviteMembersLink').should('be.visible').within(() => {
            cy.get('.arrow').click();
        });

        // * Verify accessibility support on Back button
        cy.get('button.back').focus().tab({shift: true}).tab().should('have.attr', 'aria-label', 'Back').and('have.class', 'a11y--active a11y--focused').within(() => {
            cy.get('svg').should('have.attr', 'role', 'img').and('have.attr', 'aria-label', 'Back Icon');
        });
        cy.focused().tab();

        // * Verify accessibility support on Close button
        cy.get('button.close-x').should('have.attr', 'aria-label', 'Close').and('have.class', 'a11y--active a11y--focused').within(() => {
            cy.get('svg').should('have.attr', 'role', 'img').and('have.attr', 'aria-label', 'Close Icon');
        });

        // # Click on Back button and go to Invite Guests screen
        cy.get('button.back').click();
        cy.findByTestId('inviteGuestLink').should('be.visible').within(() => {
            cy.get('.arrow').click();
        });

        // * Verify accessibility support on Back button
        cy.get('button.back').focus().tab({shift: true}).tab().should('have.attr', 'aria-label', 'Back').and('have.class', 'a11y--active a11y--focused').within(() => {
            cy.get('svg').should('have.attr', 'role', 'img').and('have.attr', 'aria-label', 'Back Icon');
        });
        cy.focused().tab();

        // * Verify accessibility support on Close button
        cy.get('button.close-x').should('have.attr', 'aria-label', 'Close').and('have.class', 'a11y--active a11y--focused').within(() => {
            cy.get('svg').should('have.attr', 'role', 'img').and('have.attr', 'aria-label', 'Close Icon');
        });

        // # Type the channel name
        cy.findByTestId('channelPlaceholder').should('be.visible').within(() => {
            cy.get('input').type('town sq', {force: true});
            cy.get('.channels-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', 'Town Square').click();
        });

        // # Click on close button
        cy.get('button.close-x').click();

        // * Verify accessibility support on Discard changes prompt
        cy.get('#confirmModal').should('be.visible').and('have.attr', 'aria-modal', 'true').and('have.attr', 'aria-labelledby', 'confirmModalLabel').and('have.attr', 'aria-describedby', 'confirmModalBody');
        cy.get('#confirmModalLabel').should('be.visible').and('have.text', 'Discard Changes');
        cy.get('#confirmModalBody').should('be.visible').and('have.text', 'You have unsent invitations, are you sure you want to discard them?');
        cy.get('#confirmModalButton').should('be.visible').click();
    });
});
