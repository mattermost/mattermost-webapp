// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
* Note: This test requires webhook server running. Initiate `npm run start:webhook` to start.
*/

import * as TIMEOUTS from '../../fixtures/timeouts';
import users from '../../fixtures/users.json';
import messageMenuOptions from '../../fixtures/message-attachments-with-menu-options.json';
import {getMessageMenusPayload} from '../../utils';

const options = [
    {text: 'Option 1', value: 'option1'},
    {text: 'Option 2', value: 'option2'},
    {text: 'Option 3', value: 'option3'},
];
const payload = getMessageMenusPayload({options});

let channelId;
let incomingWebhook;

describe('Interactive Menu', () => {
    before(() => {
        // Set required ServiceSettings
        const newSettings = {
            ServiceSettings: {
                AllowedUntrustedInternalConnections: 'localhost',
                EnablePostUsernameOverride: true,
                EnablePostIconOverride: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as sysadmin and ensure that teammate name display setting is set to default 'username'
        cy.apiLogin('sysadmin');
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.apiSaveMessageDisplayPreference('clean');

        // # Visit '/' and create incoming webhook
        cy.visit('/ad-1/channels/town-square');
        cy.getCurrentChannelId().then((id) => {
            channelId = id;

            const newIncomingHook = {
                channel_id: id,
                channel_locked: true,
                description: 'Incoming webhook interactive menu',
                display_name: 'menuIn' + Date.now(),
            };

            cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                incomingWebhook = hook;
            });
        });
    });

    it('matches elements', () => {
        // # Post an incoming webhook
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // # Get message attachment from the last post
        cy.getLastPostId().then((postId) => {
            cy.get(`#messageAttachmentList_${postId}`).as('messageAttachmentList');
        });

        // * Verify each element of message attachment list
        cy.get('@messageAttachmentList').within(() => {
            cy.get('.attachment__thumb-pretext').should('be.visible').and('have.text', 'This is attachment pretext with basic options');
            cy.get('.post-message__text-container').should('be.visible').and('have.text', 'This is attachment text with basic options');
            cy.get('.attachment-actions').should('be.visible');
            cy.get('.select-suggestion-container').should('be.visible');
            cy.get('.select-suggestion-container > input').should('be.visible').and('have.attr', 'placeholder', 'Select an option...');

            cy.get('#suggestionList').should('not.be.visible');
            cy.get('.select-suggestion-container > input').click();
            cy.get('#suggestionList').should('be.visible').children().should('have.length', options.length);

            cy.get('#suggestionList').children().each(($el, index) => {
                cy.wrap($el).should('have.text', options[index].text);
            });
        });

        // * Close suggestion list by clicking on other element
        cy.get('body').click();
    });

    it('IM15887 - Selected Option is displayed, Ephemeral message is posted', () => {
        // # Post an incoming webhook
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // # Get message attachment from the last post
        cy.getLastPostId().then((postId) => {
            cy.get(`#messageAttachmentList_${postId}`).as('messageAttachmentList');
        });

        cy.get('@messageAttachmentList').within(() => {
            // # Select option 1 by typing exact text and press enter
            cy.get('.select-suggestion-container > input').click().clear().type(`${options[0].text}{enter}`);

            // * Verify that the input is updated with the selected option
            cy.get('.select-suggestion-container > input').should('be.visible').and('have.attr', 'value', options[0].text);
        });

        cy.wait(TIMEOUTS.SMALL);

        cy.getLastPostId().then((postId) => {
            // * Verify that ephemeral message is posted, visible to observer and contains an exact message
            cy.get(`#${postId}_message`).should('be.visible').and('have.class', 'post--ephemeral');
            cy.get('.post__visibility').should('be.visible').and('have.text', '(Only visible to you)');
            cy.get(`#postMessageText_${postId}`).should('be.visible').and('have.text', 'Ephemeral | select  option: option1');
        });
    });

    it('IM15887 - Reply is displayed in center channel with "commented on [user\'s] message: [text]"', () => {
        const user1 = users['user-1'];

        // # Post an incoming webhook
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // # Get last post
        cy.getLastPostId().then((parentMessageId) => {
            // # Post another message
            cy.postMessageAs({sender: user1, message: 'Just another message', channelId});

            // # Click comment icon to open RHS
            cy.clickPostCommentIcon(parentMessageId);

            // * Check that the RHS is open
            cy.get('#rhsContainer').should('be.visible');

            // # Have another user reply to the webhook message
            cy.postMessageAs({sender: user1, message: 'Reply to webhook', channelId, rootId: parentMessageId});

            // # Get the latest post
            cy.getLastPostId().then((replyMessageId) => {
                // * Verify that the reply is in the channel view with matching text
                cy.get(`#post_${replyMessageId}`).within(() => {
                    cy.get('.post__link').should('be.visible').and('have.text', 'Commented on webhook\'s message: This is attachment pretext with basic options');
                    cy.get(`#postMessageText_${replyMessageId}`).should('be.visible').and('have.text', 'Reply to webhook');
                });

                // * Verify that the reply is in the RHS with matching text
                cy.get(`#rhsPost_${replyMessageId}`).within(() => {
                    cy.get('.post__link').should('not.be.visible');
                    cy.get(`#rhsPostMessageText_${replyMessageId}`).should('be.visible').and('have.text', 'Reply to webhook');
                });
            });
        });
    });

    it('IM21039 - Searching within the list of options', () => {
        const searchOptions = [
            {text: 'SearchOption1', value: 'searchoption1'},
            {text: 'SearchOption2', value: 'searchoption2'},
            ...options,
        ];
        const searchOptionsPayload = getMessageMenusPayload({options: searchOptions});

        // # Post an incoming webhook for interactive menu with search options
        cy.postIncomingWebhook({url: incomingWebhook.url, data: searchOptionsPayload});

        // # Get message attachment from the last post
        cy.getLastPostId().then((postId) => {
            cy.get(`#messageAttachmentList_${postId}`).as('messageAttachmentList');
        });

        cy.get('@messageAttachmentList').within(() => {
            cy.get('.select-suggestion-container > input').click().clear().type('sea');

            // * Message attachment menu dropdown should now be open
            cy.get('#suggestionList').should('exist').children().should('have.length', 2);

            // # Checking values inside the attachment menu dropdown
            cy.get('#suggestionList').within(() => {
                // * Each dropdown should contain the searchOptions text
                cy.findByText(searchOptions[0].text).should('exist');
                cy.findByText(searchOptions[1].text).should('exist');
            });
        });
    });

    it('IM21042 - "No items match" feedback', () => {
        const missingUser = Date.now();
        const userOptions = getMessageMenusPayload({dataSource: 'users'});

        // # Post an incoming webhook for interactive menu with user options
        cy.postIncomingWebhook({url: incomingWebhook.url, data: userOptions});

        // # Get message attachment from the last post
        cy.getLastPostId().then((postId) => {
            cy.get(`#messageAttachmentList_${postId}`).as('messageAttachmentList');
        });

        cy.get('@messageAttachmentList').within(() => {
            cy.get('.select-suggestion-container > input').click().clear().type(`${missingUser}`);
            cy.get('.suggestion-list__no-results').should('be.visible').should('have.text', `No items match ${missingUser}`);
        });
    });

    it('should truncate properly the selected long basic option', () => {
        const withLongBasicOption = [
            {text: 'Option 0 - This is with very long option', value: 'option0'},
            ...options,
        ];
        const basicOptions = getMessageMenusPayload({options: withLongBasicOption});

        // # Post an incoming webhook for interactive menu with basic options and verify the post
        cy.postIncomingWebhook({url: incomingWebhook.url, data: basicOptions}).then(() => {
            verifyLastPost();
        });
    });

    it('should truncate properly the selected long username option', () => {
        const userOptions = getMessageMenusPayload({dataSource: 'users'});

        // # Post an incoming webhook for interactive menu with user options and verify the post
        cy.postIncomingWebhook({url: incomingWebhook.url, data: userOptions}).then(() => {
            verifyLastPost();
        });
    });

    it('should truncate properly the selected long channel display name option', () => {
        const channelOptions = getMessageMenusPayload({dataSource: 'channels'});

        cy.getCurrentTeamId().then((teamId) => {
            // # Create channel with long display name
            cy.apiCreateChannel(teamId, 'test-channel', `AAAA Very Long Display Name of a Channel ${Date.now()}`).then(() => {
                // # Post an incoming webhook for interactive menu with channel options and verify the post
                cy.postIncomingWebhook({url: incomingWebhook.url, data: channelOptions}).then(() => {
                    verifyLastPost();
                });
            });
        });
    });

    it('IM21037 - Clicking in / Tapping on the message attachment menu box opens list of selections', () => {
        // # Create a message attachment with menu
        const basicOptionPayload = getMessageMenusPayload({options});
        cy.postIncomingWebhook({url: incomingWebhook.url, data: basicOptionPayload});

        // # Get the last posted message id
        cy.getLastPostId().then((lastPostId) => {
            // # Get the last messages attachment container
            cy.get(`#messageAttachmentList_${lastPostId}`).within(() => {
                // * Message attachment menu dropdown should be closed
                cy.get('#suggestionList').should('not.exist');

                // // # Open the message attachment menu dropdown
                cy.findByPlaceholderText('Select an option...').click();

                // * Message attachment menu dropdown should now be open
                cy.get('#suggestionList').should('exist').children().should('have.length', options.length);

                // # Checking values inside the attachment menu dropdown
                cy.get('#suggestionList').within(() => {
                    // * Each dropdown should contain the options text
                    cy.findByText(options[0].text).should('exist');
                    cy.findByText(options[1].text).should('exist');
                    cy.findByText(options[2].text).should('exist');
                });
            });

            // # Close message attachment menu dropdown
            cy.get('body').click();
        });
    });

    it('IM21044 - Change selection in RHS / Message Thread', () => {
        // # Create a webhook with distinct options
        const distinctOptions = messageMenuOptions['distinct-options'];
        const distinctListOptionPayload = getMessageMenusPayload({options: distinctOptions});
        cy.postIncomingWebhook({url: incomingWebhook.url, data: distinctListOptionPayload});

        const firstSelectedItem = distinctOptions[2].text;
        const secondSelectedItem = distinctOptions[7].text;

        // # Verify the webhook posted the message
        cy.getLastPostId().then((parentPostId) => {
            // # Get the last messages attachment container
            cy.get(`#messageAttachmentList_${parentPostId}`).within(() => {
                // # Open the message attachment menu dropdown by clickin on input
                cy.findByPlaceholderText('Select an option...').click();

                // * Message attachment dropdown with the selected item should be visible
                cy.get('#suggestionList').should('exist').within(() => {
                    // # Make a first selection from the given options
                    cy.findByText(firstSelectedItem).should('exist').click();
                });

                // * Verify the input has the selected value you clicked
                cy.findByDisplayValue(firstSelectedItem).should('exist');
            });

            // # Lets wait a little for the webhook to return confirmation message
            cy.wait(TIMEOUTS.TINY);

            // # Checking if we got the ephemeral message with the selection we made
            cy.getLastPostId().then((botLastPostId) => {
                cy.get(`#post_${botLastPostId}`).within(() => {
                    // * Check if Bot message only visible to you
                    cy.findByText('(Only visible to you)').should('exist');

                    // * Check if we got ephemeral message of our selection ie. firstSelectedItem
                    cy.findByText(/Ephemeral | select option: banana/).should('exist');
                });
            });

            // # Click on reply icon to original message with attachment message in RHS
            cy.clickPostCommentIcon(parentPostId);

            // * Verify RHS has opened
            cy.get('#rhsContainer').should('exist');

            // # Same id as parent post in center should be opened in RHS since we clicked reply button
            cy.get(`#rhsPost_${parentPostId}`).within(() => {
                // * Verify the input has the selected value same as that of Center and open dropdown to make new selection
                cy.findByDisplayValue(firstSelectedItem).should('exist').click();

                // * Message attachment dropdown with the selected item should be visible
                cy.get('#suggestionList').should('exist').within(() => {
                    // # Make a second selection different from first from options
                    cy.findByText(secondSelectedItem).should('exist').click();
                });

                // * Verify the input has the new selected value in the RHS message
                cy.findByDisplayValue(secondSelectedItem).should('exist');
            });

            // # Lets wait a little for the webhook to return confirmation message
            cy.wait(TIMEOUTS.TINY);

            // * Verify the original message with attacment's selection is also changed
            cy.get(`#messageAttachmentList_${parentPostId}`).within(() => {
                // * Verify the input in center has the new selected value i.e secondSelectedItem
                cy.findByDisplayValue(secondSelectedItem).should('exist');
            });

            // # Checking if we got updated ephemeral message with the new selection we made
            cy.getLastPostId().then((secondBotLastPostId) => {
                cy.get(`#post_${secondBotLastPostId}`).within(() => {
                // * Check if Bot message only for you
                    cy.findByText('(Only visible to you)').should('exist');

                    // * Check if we got ephemeral message of second selection
                    cy.findByText(/Ephemeral | select option: avacodo/).should('exist');
                });
            });
        });
    });
});

function verifyMessageAttachmentList(postId, isRhs, text) {
    return cy.get(`#messageAttachmentList_${postId}`).within(() => {
        cy.queryByTestId('autoCompleteSelector').should('be.visible');

        if (isRhs) {
            // * Verify that the selected option from center view matches the one in RHS
            cy.get('.select-suggestion-container > input').should('have.value', text);
        } else {
            // # Select an option (long) in center view
            cy.get('.select-suggestion-container > input').should('be.visible').click();
            cy.get('#suggestionList').should('be.visible').children().first().click({force: true});
        }

        // * Verify exact height, width and padding of suggestion container and its input
        cy.get('.select-suggestion-container').
            should('be.visible').
            and('have.css', 'height', '32px').
            and('have.css', 'width', '220px');

        cy.get('.select-suggestion-container > input').
            and('have.css', 'height', '32px').
            and('have.css', 'width', '220px').
            and('have.css', 'padding-right', '30px');

        return cy.get('.select-suggestion-container > input').invoke('attr', 'value').then((value) => {
            return cy.wrap({value});
        });
    });
}

function verifyLastPost() {
    // # Get message attachment from the last post, and
    // * Verify its content in center view
    cy.getLastPostId().then((postId) => {
        verifyMessageAttachmentList(postId, false).then(({value}) => {
            // Open the same post in RHS, and
            // * Verify its content in RHS
            cy.clickPostCommentIcon(postId);
            cy.get(`#rhsPost_${postId}`).within(() => {
                verifyMessageAttachmentList(postId, true, value);
            });
        });
    });
}
