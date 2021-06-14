// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @custom_status

import {openCustomStatusModal} from './helper';

describe('Custom Status - Verifying Where Custom Status Appears', () => {
    const customStatus = {
        emoji: 'grinning',
        text: 'Busy',
    };
    let currentUser;

    before(() => {
        cy.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: true}});

        // # Login as test user and visit channel
        cy.apiInitSetup({loginAfter: true}).then(({team, user, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
            currentUser = user;
        });
    });

    it('MM-T3850_1 set a status', () => {
        openCustomStatusModal();

        // # Type the custom status text in the custom status modal input
        cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);

        // # Select an emoji from the emoji picker and set the status
        cy.get('#custom_status_modal .StatusModal__emoji-button').click();
        cy.get('#emojiPicker').should('be.visible').find('.emoji-picker__items').should('be.visible');
        cy.findByTestId(customStatus.emoji).trigger('mouseover', {force: true}).click({force: true});
        cy.get('#custom_status_modal .GenericModal__button.confirm').should('be.visible').click();

        // * Custom status modal should be closed
        cy.get('#custom_status_modal').should('not.exist');
    });

    it('MM-T3850_2 should display the custom status emoji in LHS header', () => {
        // * Custom status emoji should be visible in the sidebar header
        cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3850_3 should show custom status emoji in the post header', () => {
        // # Post a message in the current channel
        cy.postMessage('Hello World!');

        // * Custom status emoji should be visible in the post header
        cy.get('.post.current--user .post__header span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3850_4 should show custom status emoji in the RHS post header', () => {
        // # Hover on the last post by current user and click on the Reply button
        cy.get('.post.current--user .post__header').should('be.visible').first().trigger('mouseover');
        cy.get('.post.current--user .post__header').should('be.visible').first().get('.post-menu button[aria-label="reply"]').should('exist').click({force: true});

        // * Custom status emoji should be visible in the RHS post header
        cy.get('#rhsContainer .post-right__content .post.current--user.thread__root .post__header span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

        // # Close the RHS sidebar
        cy.get('#rhsCloseButton').click();
    });

    it('MM-T3850_5 should show full custom status in the user popover', () => {
        // # Click on the post header of the last post by the current user and open profile popover
        cy.get('.post.current--user .post__header .user-popover').first().click();
        cy.get('#user-profile-popover').should('exist');

        // * Check if the profile popover contains custom status text and emoji
        cy.get('#user-profile-popover #user-popover-status').should('contain', customStatus.text);
        cy.get('#user-profile-popover #user-popover-status span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3850_6 should show custom status emoji next to username in the channel members popover', () => {
        // # Click on the Members icon in the channel header and open the Member list popover
        cy.get('#member_popover').should('exist').click();
        cy.get('#member-list-popover').should('exist');

        // * Custom status emoji should be visible next to username of the current user which is first in the list
        cy.get('#member-list-popover .more-modal__row').first().get('span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3850_7 should show custom status emoji next to username in the channel members modal', () => {
        // # Click on the View members button in the member popover and open the channel members modal
        cy.get('#member-list-popover .more-modal__button button').click();
        cy.get('#channelMembersModal').should('exist');

        // # Search the current user's username in the search input
        cy.get('#searchUsersInput').type(currentUser.username);

        // * Custom status emoji should be visible next to the username of the current user
        cy.get('#channelMembersModal .more-modal__row span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

        // # Close the channel members modal
        cy.get('#channelMembersModal .close').click();
    });

    it('MM-T3850_8 should show custom status emoji next to username in the team members modal', () => {
        // # Click on the hamburger menu in the LHS header and open the dropdown menu
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('ul.dropdown-menu').should('exist');

        // # Click on the "View Members" option in the dropdown menu and open the team members modal
        cy.get('ul.dropdown-menu').findByText('View Members').click();
        cy.get('#teamMembersModal').should('exist');

        // # Search the current user's username in the search input
        cy.get('#searchUsersInput').type(currentUser.username);

        // * Custom status emoji should be visible next to the username of the current user
        cy.get('#teamMembersModal .more-modal__row span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

        // # Close the team members modal
        cy.get('#teamMembersModal .close').click();
    });

    it('MM-T3850_9 should show custom status emoji next to username in the more direct messages modal', () => {
        // # Click on the + button for Direct messages and open the Direct messages modal
        cy.get('button[aria-label="Write a direct message"]').click();
        cy.get('#moreDmModal').should('exist');

        // # Search the current user's username in the search input
        cy.get('#moreDmModal #react-select-2-input').type(currentUser.username);

        // * Custom status emoji should be visible next to the username of the current user
        cy.get('#moreDmModal .more-modal__row span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3850_10 should show custom status emoji next to username in DM in LHS Direct Messages section and full custom status in channel header', () => {
        // # Click on the search result to open the Direct messages channel
        cy.get('#moreDmModal .more-modal__row').should('be.visible').and('contain', currentUser.username).click({force: true});

        // * Check if the channel is open and contains the channel header
        cy.get('#channelHeaderDescription .header-status__text').should('exist');

        // * Custom status text and emoji should be displayed in the channel header
        cy.get('#channelHeaderDescription .header-status__text').should('contain', customStatus.text);
        cy.get('#channelHeaderDescription .header-status__text span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

        // * Custom status emoji should be visible along with username in the  LHS Direct Messages section
        cy.get('.SidebarChannelGroup_content').contains('(you)').get('span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3850_11 should show custom status emoji at autocomplete', () => {
        // # type: /message @[username]
        cy.get('#post_textbox').should('be.visible').type(`/message @${currentUser.username}`);

        // * Autocomplete shows the user along with the custom status emoji
        cy.get('#suggestionList').find('.mentions__name').eq(0).contains(`@${currentUser.username}`).get('span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

        cy.get('#post_textbox').type('{enter}');
    });

    it('MM-T3850_12 should show custom status emoji at channel switcher', () => {
        // # Click channel switcher button
        cy.uiGetChannelSwitcher().click();

        // # Type username on the input
        cy.findByRole('textbox', {name: 'quick switch input'}).type(currentUser.username);

        // * Custom status is shown next to username in the channel switcher
        cy.get('#suggestionList').should('be.visible');
        cy.findByTestId(currentUser.username).should('be.visible').
            find('.emoticon').should('have.attr', 'data-emoticon', 'grinning');
    });
});
