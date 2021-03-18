// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @custom_status

import {openCustomStatusModal} from './helper';

describe('Custom Status - Setting Your Own Custom Status', () => {
    before(() => {
        cy.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: true}});

        // # Login as test user and visit channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    const customStatus = {
        emoji: 'grinning',
        text: 'Busy',
    };

    it('MM-T3846_1 should change the emoji to speech balloon when typed in the input', () => {
        // # Open the custom status modal
        openCustomStatusModal();

        // * Default emoji is currently visible in the custom status input
        cy.get('#custom_status_modal .StatusModal__emoji-button span').should('have.class', 'icon--emoji');

        // # Type the status text in the input
        cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);

        // * Speech balloon emoji should now be visible in the custom status input
        cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', 'speech_balloon');
    });

    it('MM-T3846_2 should display the emoji picker when clicked on the emoji button', () => {
        // # Click on the emoji button in the custom status input
        cy.get('#custom_status_modal .StatusModal__emoji-button').click();

        // * Emoji picker overlay should be opened
        cy.get('#emojiPicker').should('exist');
    });

    it('MM_T3846_3 should select the emoji from the emoji picker', () => {
        // * Check that the emoji picker is open
        cy.get('#emojiPicker').should('exist');

        // # Select the emoji from the emoji picker overlay
        cy.get(`#emojiPicker .emoji-picker-items__container .emoji-picker__item img[data-testid="${customStatus.emoji}"]`).click();

        // * Emoji picker should be closed
        cy.get('#emojiPicker').should('not.exist');

        // * Selected emoji should be set in the custom status input emoji button
        cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3846_4 should set custom status when click on Set Status', () => {
        // # Click on the Set Status button
        cy.get('#custom_status_modal .GenericModal__button.confirm').click();

        // * Custom status modal should be closed
        cy.get('#custom_status_modal').should('not.exist');

        // * Correct custom status emoji should be displayed in the sidebar header
        cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3846_5 should show custom status with emoji and clear button in the status dropdown', () => {
        // # Click on the sidebar header to open status dropdown
        cy.get('.MenuWrapper .status-wrapper').click();

        // * Status dropdown should be open
        cy.get('#statusDropdownMenu').should('exist');

        // * Correct custom status text and emoji should be displayed in the status dropdown
        cy.get('.status-dropdown-menu .custom_status__row').should('have.text', customStatus.text);
        cy.get('.status-dropdown-menu .custom_status__row span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

        // * Clear button should be visible in the status dropdown
        cy.get('.status-dropdown-menu #custom_status__clear').should('exist');
    });

    it('MM-T3846_6 should clear the custom status text when clear button is clicked', () => {
        // # Click on the clear button in the status dropdown
        cy.get('.status-dropdown-menu #custom_status__clear').click();

        // * Custom status text should be removed and "Set a Custom Status" should be displayed in the status dropdown
        cy.get('.status-dropdown-menu .custom_status__row').should('have.text', 'Set a Custom Status');
    });

    it('MM-T3846_7 should show previosly set status in the first position in Recents list', () => {
        // # Click on the "Set a Custom Status" option in the status dropdown
        cy.get('.status-dropdown-menu li#status-menu-custom-status').click();

        // * Custom status modal should open
        cy.get('#custom_status_modal').should('exist');

        // * Previously set status should be first in the recents list along with the correct emoji
        cy.get('#custom_status_modal .statusSuggestion__row').first().find('.statusSuggestion__text').should('have.text', customStatus.text);
        cy.get('#custom_status_modal .statusSuggestion__row').first().find('span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3846_8 should set the same status again when clicked on the Set status', () => {
        // # Select the first suggestion from the list and set the status
        cy.get('#custom_status_modal .statusSuggestion__row').first().click();
        cy.get('#custom_status_modal .GenericModal__button.confirm').click();

        // * Custom status modal should be closed
        cy.get('#custom_status_modal').should('not.exist');

        // * Correct custom status emoji should be displayed in the sidebar header
        cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T3846_9 should clear the status when clicked on Clear status button', () => {
        openCustomStatusModal();

        // # Click on the Clear status button
        cy.get('#custom_status_modal').findByText('Clear Status').click();

        // # Open status dropdown
        cy.get('.MenuWrapper .status-wrapper').click();

        // * Custom status text should not be displayed in the status dropdown
        cy.get('.status-dropdown-menu .custom_status__row').should('not.have.text', customStatus.text);
    });
});
