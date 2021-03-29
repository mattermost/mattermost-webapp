// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @integrations

/**
* Note: This test requires webhook server running. Initiate `npm run start:webhook` to start.
*/

import {getRandomId} from '../../utils';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Integrations', () => {
    let user1;
    let user2;
    let team1;
    let team2;
    let testChannelUrl1;
    let testChannelUrl2;
    let commandURL;

    const commandTrigger = 'test-ephemeral';
    const timestamp = Date.now();

    before(() => {
        cy.requireWebhookServer();
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLinkPreviews: true,
            },
        });

        cy.apiInitSetup().then(({team, user}) => {
            user1 = user;
            team1 = team;
            testChannelUrl1 = `/${team.name}/channels/town-square`;
            cy.apiGetChannelByName(team1.name, 'town-square').then(({channel}) => {
                commandURL = `${Cypress.env().webhookBaseUrl}/send_message_to_channel?channel_id=${channel.id}`;
            });

            cy.apiCreateUser().then(({user: otherUser}) => {
                user2 = otherUser;
                cy.apiAddUserToTeam(team.id, user2.id);
            });

            cy.apiCreateTeam(`test-team-${timestamp}`, `test-team-${timestamp}`).then(({team: anotherTeam}) => {
                team2 = anotherTeam;
                testChannelUrl2 = `/${team2.name}/channels/town-square`;
                cy.apiAddUserToTeam(team2.id, user1.id);
                cy.apiAddUserToTeam(team2.id, user2.id);
            });
        });
    });

    it('MM-T662 /join command for private channels', () => {
        const privateChannelName = `private-channel-${getRandomId()}`;

        cy.apiLogin(user1);
        cy.visit(testChannelUrl1);

        // # User 1 Create a private channel, with ${channelName}
        cy.uiBrowseOrCreateChannel('Create New Channel').click();
        cy.get('#private').click().wait(TIMEOUTS.HALF_SEC);
        cy.get('#newChannelName').should('be.visible').type(privateChannelName);
        cy.get('#submitNewChannel').click();

        // # User, who is a member of the channel, try /join command without tilde
        cy.uiGetLhsSection('CHANNELS').findByText('Town Square').click();
        cy.postMessage(`/join ${privateChannelName}`);

        // * Private channel should be active
        cy.uiGetLhsSection('CHANNELS').get('.active').should('contain', privateChannelName);

        // # User, who is a member of the channel, try /join command with tilde
        cy.uiGetLhsSection('CHANNELS').findByText('Town Square').click();
        cy.postMessage(`/join ~${privateChannelName}`);

        // * private channel should be active
        cy.uiGetLhsSection('CHANNELS').find('.active').should('contain', privateChannelName);

        // # Login with user without privilege
        cy.apiLogin(user2);
        cy.visit(testChannelUrl1);

        // # User, who is *not* a member of the channel, try /join command without tilde
        cy.uiGetLhsSection('CHANNELS').findByText('Town Square').click();
        cy.postMessage(`/join ${privateChannelName}`);

        // * Error message should be presented.
        cy.getLastPost().should('contain', 'An error occurred while joining the channel.').and('contain', 'System');

        // # User, who is *not* a member of the channel, try /join command with tilde
        cy.uiGetLhsSection('CHANNELS').findByText('Town Square').click();
        cy.postMessage(`/join ~${privateChannelName}`);

        // * Error message should be presented.
        cy.getLastPost().should('contain', 'An error occurred while joining the channel.').and('contain', 'System');
    });

    it('MM-T663 /open command for private channels', () => {
        const privateChannelName = `private-channel-${getRandomId()}`;

        cy.apiLogin(user1);
        cy.visit(testChannelUrl1);

        // # User 1 Create a private channel, with ${channelName}
        cy.uiBrowseOrCreateChannel('Create New Channel').click();
        cy.get('#private').click().wait(TIMEOUTS.HALF_SEC);
        cy.get('#newChannelName').should('be.visible').type(privateChannelName);
        cy.get('#submitNewChannel').click();

        // # User, who is a member of the channel, try /open command without tilde
        cy.uiGetLhsSection('CHANNELS').findByText('Town Square').click();
        cy.postMessage(`/open ${privateChannelName}`);

        // * Private channel should be active
        cy.uiGetLhsSection('CHANNELS').find('.active').should('contain', privateChannelName);

        // # User, who is a member of the channel, try /open command with tilde
        cy.uiGetLhsSection('CHANNELS').findByText('Town Square').click();
        cy.postMessage(`/open ~${privateChannelName}`);

        // * Private channel should be active
        cy.uiGetLhsSection('CHANNELS').find('.active').should('contain', privateChannelName);

        // # Login with user without privilege
        cy.apiLogin(user2);
        cy.visit(testChannelUrl1);

        // # User, who is *not* a member of the channel, try /open command without tilde
        cy.uiGetLhsSection('CHANNELS').findByText('Town Square').click();
        cy.postMessage(`/open ${privateChannelName}`);

        // * Error message should be presented.
        cy.getLastPost().should('contain', 'An error occurred while joining the channel.').and('contain', 'System');

        // # User, who is *not* a member of the channel, try /open command with tilde
        cy.uiGetLhsSection('CHANNELS').findByText('Town Square').click();
        cy.postMessage(`/open ~${privateChannelName}`);

        // * Error message should be presented.
        cy.getLastPost().should('contain', 'An error occurred while joining the channel.').and('contain', 'System');
    });

    it('MM-T687 /msg', () => {
        cy.apiLogin(user1);
        cy.visit(testChannelUrl1);

        // # Post message
        cy.postMessage(`/msg @${user2.username} Test message`);

        // * The user stays in the same team
        cy.get(`#${team1.name}TeamButton`).parent().should('have.class', 'active');

        // * The user is in the DM channel with user2
        cy.get(`#sidebarItem_${Cypress._.sortBy([user1.id, user2.id]).join('__')}`).parent().should('have.class', 'active');

        // * The last message is written by user1 and contains the correct text.
        cy.getLastPost().should('contain', 'Test message').and('contain', user1.username);

        cy.visit(testChannelUrl2);

        // # Post message
        cy.postMessage(`/msg @${user2.username} Second test`);

        // * The user stays in the same team
        cy.get(`#${team2.name}TeamButton`).parent().should('have.class', 'active');

        // * The user is in the DM channel with user2
        cy.get(`#sidebarItem_${Cypress._.sortBy([user1.id, user2.id]).join('__')}`).parent().should('have.class', 'active');

        // * The last message is written by user1 and contains the correct text.
        cy.getLastPost().should('contain', 'Second test').and('contain', user1.username);
    });

    it('MM-T688 /expand', () => {
        cy.apiLogin(user1);
        cy.visit(testChannelUrl1);

        // # Post message
        cy.postMessage('http://www.mattermost.org/wp-content/uploads/2016/04/icon_WS.png');
        cy.getLastPostId().as('postID');

        // # Post command
        cy.postMessage('/expand');

        cy.get('@postID').then((postID) => {
            cy.get(`#post_${postID}`).should('be.visible').within(() => {
                // * Preview should be expanded
                cy.findByLabelText('Toggle Embed Visibility').
                    should('be.visible').and('have.attr', 'data-expanded', 'true');

                // * Preview should be visible
                cy.findByLabelText('file thumbnail').should('be.visible');
            });
        });

        // * System post received confirming the new setting
        cy.getLastPost().should('contain', 'Image links now expand by default').and('contain', 'System');
    });

    it('MM-T689 capital letter autocomplete, /collapse', () => {
        cy.apiLogin(user1);
        cy.visit(testChannelUrl1);

        // # Post message
        cy.postMessage('http://www.mattermost.org/wp-content/uploads/2016/04/icon_WS.png');
        cy.getLastPostId().as('postID');

        // # Open RHS
        cy.clickPostCommentIcon();

        // # Type uppercase letter
        cy.get('#reply_textbox').type('/C');

        // # Scan inside of suggestion list
        cy.get('#suggestionList').should('exist').and('be.visible').within(() => {
            // * Verify the collapse option exist in autocomplete and select it
            cy.findAllByText('collapse').first().should('exist').click();
        });

        // # Hit enter to send the message
        cy.get('#reply_textbox').type('{enter}');

        cy.get('@postID').then((postID) => {
            cy.get(`#rhsPost_${postID}`).should('be.visible').within(() => {
                // * Preview should not be expanded
                cy.findByLabelText('Toggle Embed Visibility').
                    should('be.visible').and('have.attr', 'data-expanded', 'false');

                // * Preview should not be visible
                cy.findByLabelText('file thumbnail').should('not.exist');
            });
        });

        // * System post received confirming the new setting
        cy.getLastPost().should('contain', 'Image links now collapse by default').and('contain', 'System');
    });

    it('MM-T705 Ephemeral message', () => {
        cy.apiAdminLogin();
        cy.visit(testChannelUrl1);

        // # Navigate to slash commands and create the slash command
        cy.get('#headerInfo').click();
        cy.get('#integrations').click();
        cy.get('#slashCommands').click();
        cy.get('#addSlashCommand').click();
        cy.get('#displayName').type(`Test${timestamp}`);
        cy.get('#trigger').type(commandTrigger);
        cy.get('#url').type(commandURL);
        cy.get('#saveCommand').click();
        cy.get('#doneButton').click();
        cy.findByText('Back to Mattermost').click();

        // # Post slash command
        cy.postMessage(`/${commandTrigger}`);
        cy.getLastPost().within(() => {
            // * Should come from the webhook bot
            cy.get('.BotBadge').should('exist');

            // * Should contain the "Hello World" text
            cy.findByText('Hello World').should('exist');
        });
    });
});
