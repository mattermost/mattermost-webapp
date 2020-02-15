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

import {getMessageMenusPayload} from '../../utils';

const searchOptions = [
    {text: 'SearchOption1', value: 'searchoption1'},
    {text: 'SearchOption2', value: 'searchoption2'},
    {text: 'Option 1', value: 'option1'},
    {text: 'Option 2', value: 'option2'},
    {text: 'Option 3', value: 'option3'},
];

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

        // # Create and visit new channel and create incoming webhook
        cy.createAndVisitNewChannel().then((channel) => {
            channelId = channel.id;

            const newIncomingHook = {
                channel_id: channelId,
                channel_locked: true,
                description: 'Incoming webhook interactive menu',
                display_name: 'menuIn' + Date.now(),
            };

            cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                incomingWebhook = hook;
            });
        });
    });

    it('IM21041 - Using up/down keys to make a selection from SEARCH results', () => {
        const searchOptionsPayload = getMessageMenusPayload({options: searchOptions});

        // # Post an incoming webhook for interactive menu with search options
        cy.postIncomingWebhook({url: incomingWebhook.url, data: searchOptionsPayload});

        // # Get message attachment from the last post
        cy.getLastPostId().then((postId) => {
            cy.get(`#messageAttachmentList_${postId}`).as('messageAttachmentList');
        });

        cy.get('@messageAttachmentList').within(() => {
            cy.findByPlaceholderText('Select an option...').click().clear().type('sea');

            // * Message attachment menu dropdown should now be open
            cy.get('#suggestionList').should('exist').children().should('have.length', 2);

            // # Checking values inside the attachment menu dropdown
            cy.get('#suggestionList').within(() => {
                // * Each dropdown should contain the searchOptions text
                cy.findByText(searchOptions[0].text).should('exist');
                cy.findByText(searchOptions[1].text).should('exist');

                // * First coincident element of the search should be hightlighted and the rest should not
                cy.findByText(searchOptions[0].text).should('have.class', 'suggestion--selected');
                cy.findByText(searchOptions[1].text).should('not.have.class', 'suggestion--selected');
            });

            // # Type downarrow to select next option
            cy.findByPlaceholderText('Select an option...').type('{downarrow}');
            cy.get('#suggestionList').within(() => {
                // * Second element should be highlighted and first should not
                cy.findByText(searchOptions[0].text).should('not.have.class', 'suggestion--selected');
                cy.findByText(searchOptions[1].text).should('have.class', 'suggestion--selected');
            });

            // # Type uparrow to select previous option
            cy.findByPlaceholderText('Select an option...').type('{uparrow}');
            cy.get('#suggestionList').within(() => {
                // * First element should be highlighted and second should not
                cy.findByText(searchOptions[0].text).should('have.class', 'suggestion--selected');
                cy.findByText(searchOptions[1].text).should('not.have.class', 'suggestion--selected');
            });
        });
    });
});