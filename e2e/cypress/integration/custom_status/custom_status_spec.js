// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @custom_status

import {openCustomStatusModal} from './helper';

describe('Custom Status modal', () => {
    let currentUser;
    before(() => {
        cy.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: true}});

        // # Login as test user and visit channel
        cy.apiInitSetup({loginAfter: true}).then(({team, user, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
            currentUser = user;
        });
    });

    describe('MM-T3851 Custom status CTAs for new users', () => {
        it('MM-T3851_1 should show Update your status in the post header', () => {
            // # Post a message in the channel
            cy.postMessage('Hello World!');

            // * Check if the post header contains "Update your status" button
            cy.get('.post.current--user .post__header').findByText('Update your status').should('exist');
        });

        it('MM-T3851_2 should open status dropdown with pulsating dot when clicked on Update your status post header', () => {
            // # Click the "Update your status" button
            cy.get('.post.current--user .post__header').findByText('Update your status').click();

            // * Status dropdown should open
            cy.get('#statusDropdownMenu').should('exist');

            // * Pulsating dot should be visible in the status dropdown
            cy.get('#statusDropdownMenu .custom_status__row .pulsating_dot').should('exist');
        });

        it('MM-T3851_3 should remove pulsating dot and Update your status post header after opening modal', () => {
            // # Open custom status modal and close it
            cy.get('#statusDropdownMenu .custom_status__row .pulsating_dot').click();
            cy.get('#custom_status_modal').should('exist').get('button.close').click();

            // * Check if the post header contains "Update your status" button
            cy.get('.post.current--user .post__header').findByText('Update your status').should('not.exist');

            // * Check if the pulsating dot exists by opening status dropdown
            cy.get('.MenuWrapper .status-wrapper').click();
            cy.get('#statusDropdownMenu .custom_status__row .pulsating_dot').should('not.exist');
        });
    });

    describe('MM-T3836 Setting a custom status', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
        });

        const defaultCustomStatuses = ['In a meeting', 'Out for lunch', 'Out sick', 'Working from home', 'On a vacation'];
        const customStatus = {
            emoji: 'calendar',
            text: 'In a meeting',
        };

        it('MM-T3836_1 should open status dropdown', () => {
            // # Click on the sidebar header to open status dropdown
            cy.get('.MenuWrapper .status-wrapper').click();

            // * Check if the status dropdown opens
            cy.get('#statusDropdownMenu').should('exist');
        });

        it('MM-T3836_2 Custom status modal opens with 5 default statuses listed', () => {
            // # Open custom status modal
            cy.get('#statusDropdownMenu li#status-menu-custom-status').click();
            cy.get('#custom_status_modal').should('exist');

            // * Check if all the default suggestions exist
            defaultCustomStatuses.map((statusText) => cy.get('#custom_status_modal .statusSuggestion__content').contains('span', statusText));
        });

        it('MM-T3836_3 "In a meeting" is selected with the calendar emoji', () => {
            // * Default emoji is currently visible in the custom status input
            cy.get('#custom_status_modal .StatusModal__emoji-button span').should('have.class', 'icon--emoji');

            // * Input should be empty
            cy.get('#custom_status_modal input.form-control').should('have.value', '');

            // # Select a custom status from the suggestions
            cy.get('#custom_status_modal .statusSuggestion__content').contains('span', customStatus.text).click();

            // * Emoji in the custom status input should be changed
            cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

            // * Selected custom status text should be in the input
            cy.get('#custom_status_modal input.form-control').should('have.value', customStatus.text);
        });

        it('MM-T3836_4 In a meeting is cleared when clicked on "x" in the input', () => {
            // * Suggestions should not be visible
            cy.get('#custom_status_modal .statusSuggestion').should('not.exist');

            // # Click on the clear button
            cy.get('#custom_status_modal .StatusModal__clear-container').click();

            // * Input should be empty
            cy.get('#custom_status_modal input.form-control').should('have.value', '');

            // * All the suggestions should be visible again
            defaultCustomStatuses.map((statusText) => cy.get('#custom_status_modal .statusSuggestion__content').contains('span', statusText));
        });

        it('MM-T3836_5 "In a meeting" is selected with the calendar emoji', () => {
            // * Default emoji is currently visible in the custom status input
            cy.get('#custom_status_modal .StatusModal__emoji-button span').should('have.class', 'icon--emoji');

            // * Input should be empty
            cy.get('#custom_status_modal input.form-control').should('have.value', '');

            // # Select a custom status from the suggestions
            cy.get('#custom_status_modal .statusSuggestion__content').contains('span', customStatus.text).click();

            // * Emoji in the custom status input should be changed
            cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

            // * Selected custom status text should be in the input
            cy.get('#custom_status_modal input.form-control').should('have.value', customStatus.text);
        });

        it('MM-T3836_6 should set custom status when click on Set Status', () => {
            // # Click on the Set Status button
            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

            // * Modal should be closed
            cy.get('#custom_status_modal').should('not.exist');

            // * Status should be set and the emoji should be visible in the sidebar header
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });

        it('MM-T3836_7 should display the custom status tooltip when hover on the emoji in LHS header', () => {
            // # Hover on the custom status emoji in the sidebar header
            cy.get('#headerInfoContent span.emoticon').trigger('mouseover');

            // * Custom status tooltip should be visible
            cy.get('#custom-status-tooltip').should('exist');

            // * Tooltip should contain the correct custom status emoji
            cy.get('#custom-status-tooltip .custom-status span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

            // * Tooltip should contain the correct custom status text
            cy.get('#custom-status-tooltip .custom-status span.custom-status-text').should('have.text', customStatus.text);
        });

        it('MM-T3836_8 should open custom status modal when emoji in LHS header is clicked', () => {
            // * Check that the custom status modal is not open
            cy.get('#custom_status_modal').should('not.exist');

            // # Click on the custom status emoji in the sidebar header
            cy.get('#headerInfoContent span.emoticon').click();

            // * Check that the custom status modal should be open
            cy.get('#custom_status_modal').should('exist');
        });
    });

    describe('MM-T3846 Setting your own custom status', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
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

    describe('MM-T3847 Recent statuses', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
        });

        const customStatus = {
            emoji: 'grinning',
            text: 'Busy',
        };

        const defaultStatus = {
            emoji: 'calendar',
            text: 'In a meeting',
        };

        it('MM-T3847_1 set a status', () => {
            openCustomStatusModal();

            // # Type the custom status text in the custom status modal input
            cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);

            // # Select an emoji from the emoji picker and set the status
            cy.get('#custom_status_modal .StatusModal__emoji-button').click();
            cy.get(`#emojiPicker .emoji-picker-items__container .emoji-picker__item img[data-testid="${customStatus.emoji}"]`).click();
            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

            // * Custom status emoji should be visible in the sidebar header
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });

        it('MM-T3847_2 should show status in the top in the Recents list', () => {
            openCustomStatusModal();

            // # Click on the clear button in the custom status modal
            cy.get('#custom_status_modal .StatusModal__clear-container').click();

            // * Custom status modal input should be empty
            cy.get('#custom_status_modal input.form-control').should('have.value', '');

            // * Set status should be the first in the Recents list
            cy.get('#custom_status_modal #statusSuggestion__recents .statusSuggestion__row').first().find('.statusSuggestion__text').should('have.text', customStatus.text);
        });

        it('MM-T3847_3 should remove the status from Recents list when corresponding clear button is clicked', () => {
            // # Hover on the first suggestion in the Recents list and the clear button should be visible
            cy.get('#custom_status_modal #statusSuggestion__recents .statusSuggestion__row').first().trigger('mouseover');
            cy.get('#custom_status_modal #statusSuggestion__recents .statusSuggestion__row').first().get('.suggestion-clear').should('be.visible');

            // # Click on the clear button of the suggestion to remove the suggestion from the Recents list
            cy.get('#custom_status_modal #statusSuggestion__recents .statusSuggestion__row').first().get('.suggestion-clear').click();

            // * The custom status should be removed from the Recents
            cy.get('#custom_status_modal #statusSuggestion__recents').should('not.contain', customStatus.text);
        });

        it('MM-T3847_4 should set default status when clicked on the status', () => {
            // # Set a custom status from the Suggestions by clicking on it and then clicking "Set Status" button
            cy.get('#custom_status_modal .statusSuggestion__content').contains('span', defaultStatus.text).click();
            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

            // * Check if custom status is successfully set by checking the emoji in the sidebar header
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', defaultStatus.emoji);
        });

        it('MM-T3847_5 should show status set in step 4 in the top in the Recents list', () => {
            openCustomStatusModal();

            // # Click on the clear button in the custom status modal input
            cy.get('#custom_status_modal .StatusModal__clear-container').click();

            // * Custom status modal input should be empty
            cy.get('#custom_status_modal input.form-control').should('have.value', '');

            // * The set status should be present at the top of the Recents list
            cy.get('#custom_status_modal #statusSuggestion__recents .statusSuggestion__row').first().find('.statusSuggestion__text').should('have.text', defaultStatus.text);
        });

        it('MM-T3847_6 should remove the default status from Recents and show in the Suggestions', () => {
            cy.get('#custom_status_modal #statusSuggestion__recents .statusSuggestion__row').first().trigger('mouseover');
            cy.get('#custom_status_modal #statusSuggestion__recents .statusSuggestion__row').first().get('.suggestion-clear').should('be.visible');

            // * The set status should be present in Recents list and not in the Suggestions list
            cy.get('#custom_status_modal #statusSuggestion__recents').should('contain', defaultStatus.text);
            cy.get('#custom_status_modal #statusSuggestion__suggestions').should('not.contain', defaultStatus.text);

            // # Click on the clear button of the topmost suggestion
            cy.get('#custom_status_modal #statusSuggestion__recents .statusSuggestion__row').first().get('.suggestion-clear').click();

            // * The status should be moved from the Recents list to the Suggestions list
            cy.get('#custom_status_modal #statusSuggestion__recents').should('not.contain', defaultStatus.text);
            cy.get('#custom_status_modal #statusSuggestion__suggestions').should('contain', defaultStatus.text);
        });
    });

    describe('MM-T3850 Verifying where the custom status appears', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
        });

        const customStatus = {
            emoji: 'grinning',
            text: 'Busy',
        };

        it('MM-T3850_1 set a status', () => {
            openCustomStatusModal();

            // # Type the custom status text in the custom status modal input
            cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);

            // # Select an emoji from the emoji picker and set the status
            cy.get('#custom_status_modal .StatusModal__emoji-button').click();
            cy.get(`#emojiPicker .emoji-picker-items__container .emoji-picker__item img[data-testid="${customStatus.emoji}"]`).click();
            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

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
            cy.get('#rhsContent .post.current--user.thread__root .post__header span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

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
            cy.get('#moreDmModal .more-modal__row').click();

            // * Check if the channel is open and contains the channel header
            cy.get('#channelHeaderDescription .header-status__text').should('exist');

            // * Custom status text and emoji should be displayed in the channel header
            cy.get('#channelHeaderDescription .header-status__text').should('contain', customStatus.text);
            cy.get('#channelHeaderDescription .header-status__text span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

            // * Custom status emoji should be visible along with username in the  LHS Direct Messages section
            cy.get('.SidebarChannelGroup_content').contains('(you)').get('span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });
    });

    describe('MM-T3852 Custom Status slash commands', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
        });

        const customStatus = {
            emoji: 'laughing',
            text: 'Feeling happy',
        };

        it('MM-T3852_1 should set custom status by slash command', () => {
            // # Set the custom status using slash command
            cy.postMessage(`/status :${customStatus.emoji}: ${customStatus.text}`);

            // * Check if custom status is successfully set by checking the emoji in the sidebar header
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

            // * Check if the last system message tells that the custom status is set and contains the custom status emoji and text
            cy.get('.post.post--system').last().
                should('contain.text', 'Your status is set to “').
                and('contain.text', ` ${customStatus.text}”. You can change your status from the status popover in the channel sidebar header.`);
            cy.get('.post.post--system').last().get(`span[data-emoticon="${customStatus.emoji}"]`).should('exist');
        });

        it('MM-T3852_2 should clear custom status by slash command', () => {
            // # Clear the custom status using slash command
            cy.postMessage('/status clear');

            // * Check if custom status is successfully cleared by checking the emoji in the sidebar header
            cy.get('#headerInfoContent span.emoticon').should('not.exist');

            // * Check if the last system message tells that the status is cleared
            cy.get('.post.post--system').last().should('contain.text', 'Your status was cleared.');
        });
    });
});
