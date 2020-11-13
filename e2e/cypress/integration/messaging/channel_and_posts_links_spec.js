// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import {getAdminAccount} from '../../support/env';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Message permalink', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;
    let sysadmin;
    let notinchannelUser;

    before(() => {
        sysadmin = getAdminAccount();

        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.apiCreateUser().then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });

            cy.apiCreateUser({prefix: 'notinchannel'}).then(({user: user1}) => {
                notinchannelUser = user1;
                cy.apiAddUserToTeam(testTeam.id, notinchannelUser.id);
            });
        });
    });

    // it('MM-T1630 - "Jump" to convo works every time for a conversation', () => {
    // });

    it('MM-T2222 - Channel shortlinking - ~ autocomplete', () => {
        const publicChannelName = 'town-square';
        const publicChannelDisplayName = 'Town Square';

        cy.visit(`/${testTeam.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

        // # Clear then type ~ and prefix of channel name
        cy.get('#post_textbox').should('be.visible').clear().type('~' + publicChannelName.substring(0, 3));

        // * Verify that the item is displayed or not as expected.
        cy.get('#suggestionList').should('be.visible').within(() => {
            cy.findByText(publicChannelDisplayName).should('be.visible');
        });

        // # Post channel mention
        cy.get('#post_textbox').type('{enter}{enter}');

        // # Check that the user name has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', publicChannelDisplayName);
            cy.get('a.mention-link').click();
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', publicChannelDisplayName);
        });
    });

    it('MM-T2224 - Channel shortlinking - link joins public channel', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`).wait(TIMEOUTS.FIVE_SEC);

        // # Clear then type ~ and prefix of channel name
        cy.get('#post_textbox').should('be.visible').clear().type(`~${testChannel.display_name}`);

        // * Verify that the item is displayed or not as expected.
        cy.get('#suggestionList').within(() => {
            cy.findByText(`${testChannel.display_name}`).should('be.visible');
        });

        // # Post channel mention
        cy.get('#post_textbox').type('{enter}{enter}');

        cy.apiLogout();
        cy.apiLogin(notinchannelUser);

        // # Check that the user name has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', `${testChannel.display_name}`);
            cy.get('a.mention-link').click();
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', `${testChannel.display_name}`);
        }).then(() => {
            cy.apiLogout();
            cy.apiLogin(sysadmin);
        });
    });

    it('MM-T2234 - Permalink - auto joins public channel', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`).wait(TIMEOUTS.FIVE_SEC);

        // # Post message
        cy.postMessage('Test');

        // # Create permalink to post
        cy.getLastPostId().then((id) => {
            const permalink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${id}`;

            // # Click on ... button of last post
            cy.clickPostDotMenu(id);

            // # Click on "Copy Link"
            cy.uiClickCopyLink(permalink);

            // # Leave the channel
            cy.visit(`/${testTeam.name}/channels/town-square`).wait(TIMEOUTS.FIVE_SEC);

            // # Visit the permalink
            cy.visit(`${permalink}`);

            // # Check that the user name has been posted
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).should('contain', 'Test');
            });
        });
    });

    it('MM-T2236 - Permalink - does not auto join private channel', () => {
        cy.apiCreateChannel(testTeam.id, 'channel', 'channel', 'P').then(({channel}) => {
            // # Visit the channel
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);

            // # Post message
            cy.postMessage('Test');

            // # Create permalink to post
            cy.getLastPostId().then((id) => {
                const permalink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${id}`;

                // # Click on ... button of last post
                cy.clickPostDotMenu(id);

                // # Click on "Copy Link"
                cy.uiClickCopyLink(permalink);

                // # Leave the channel
                cy.visit(`/${testTeam.name}/channels/town-square`).wait(TIMEOUTS.FIVE_SEC);

                cy.apiLogout();
                cy.apiLogin(testUser);

                // # Visit the permalink
                cy.visit(`${permalink}`);

                cy.findByText('Permalink belongs to a deleted message or to a channel to which you do not have access.').should('be.visible');
            }).then(() => {
                cy.apiLogout();
                cy.apiLogin(sysadmin);
            });
        });
    });

    it('MM-T3471 - Clicking/tapping channel URL link joins public channel', () => {
        let tempUser;

        // # Create a temporary user
        cy.apiCreateUser({prefix: 'temp'}).then(({user: user1}) => {
            tempUser = user1;
            cy.apiAddUserToTeam(testTeam.id, tempUser.id);

            cy.apiLogout();
            cy.apiLogin(otherUser);

            cy.visit(`/${testTeam.name}/channels/town-square`).wait(TIMEOUTS.FIVE_SEC);

            // # Clear then type channel url
            cy.get('#post_textbox').should('be.visible').clear().type(`${Cypress.config('baseUrl')}/${testTeam.name}/channels/${testChannel.name}`).type('{enter}');

            cy.apiLogout();
            cy.apiLogin(tempUser);
            cy.visit(`/${testTeam.name}/channels/town-square`).wait(TIMEOUTS.FIVE_SEC);

            // # Check that the channel permalink has been posted
            cy.getLastPostId().then((postId) => {
                cy.get('a.markdown__link').click();
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', `${testChannel.display_name}`);
            });
        });
    });
});
