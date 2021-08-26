// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @integrations

import * as TIMEOUTS from '../../../fixtures/timeouts';
import {getRandomId} from '../../../utils';

describe('Integrations', () => {
    let testUser;
    let testChannel;
    let otherChannel;

    before(() => {
        cy.apiInitSetup({userPrefix: 'testUser'}).then(({team, user, channel}) => {
            testUser = user;
            testChannel = channel;

            cy.apiCreateChannel(team.id, 'other-channel', 'Other Channel').then((out) => {
                otherChannel = out.channel;
            });

            cy.apiLogin(testUser);
            cy.visit('/');
        });
    });

    beforeEach(() => {
        cy.get('#sidebarItem_town-square').click();
        cy.get('#post_textbox').should('be.visible');
    });

    it('MM-T683 /join', () => {
        // # Type "/join ~new-channel"
        cy.postMessage(`/join ~${otherChannel.name} `);

        // * Verify user is redirected to New Channel
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', otherChannel.display_name);
    });

    it('MM-T684 /me', () => {
        // # Type "/me message"
        const message = getRandomId();
        cy.postMessage(`/me ${message}`);

        // * Verify a message is posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', testUser.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', message);

            // * The message should match other system message formatting.
            cy.get(`#post_${postId}`).should('have.class', 'post--system');
        });
    });

    it('MM-T685 /me not case-sensitive', () => {
        // # Type "/Me message"
        const message = getRandomId();
        cy.postMessage(`/Me ${message}`);

        // * Verify a message is posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', testUser.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', message);
        });
    });

    it('MM-T2345 /me on RHS', () => {
        cy.get(`#sidebarItem_${testChannel.name}`).click();
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', testChannel.display_name);

        const rootMessage = 'root message';
        cy.postMessage(rootMessage);

        // # Open RHS (reply thread)
        cy.clickPostCommentIcon();

        cy.getLastPostId().then((postId) => {
            // * Verify the message, both in RHS and center, is from current user and formatted with full opacity
            [`#rhsPost_${postId}`, `#post_${postId}`].forEach((selector) => {
                cy.get(selector).should('have.class', 'current--user').within((el) => {
                    cy.get('.profile-icon').should('be.visible');
                    cy.get('.post__header').should('be.visible').
                        findByLabelText(testUser.username).should('be.visible');
                    cy.get('.post__header').should('be.visible').and('contain', testUser.username);
                    cy.wrap(el).findByText(rootMessage).should('be.visible').and('have.css', 'color', 'rgb(63, 67, 80)');
                });
            });
        });

        // # type /me message
        const message = 'reply';
        cy.postMessageReplyInRHS(`/me ${message} `);
        cy.uiWaitUntilMessagePostedIncludes(message);

        cy.getLastPostId().then((postId) => {
            // * Verify the message reply, both in RHS and center, is from current user and formatted with lower opacity
            [`#rhsPost_${postId}`, `#post_${postId}`].forEach((selector, index) => {
                cy.get(selector).should('have.class', 'current--user').within((el) => {
                    cy.get('.profile-icon').should(index === 0 ? 'not.exist' : 'not.be.visible');
                    cy.wrap(el).findByText(message).should('be.visible').and('have.css', 'color', 'rgba(63, 67, 80, 0.6)');
                });
            });
        });
    });

    it('MM-T710 /mute error message', () => {
        const invalidChannel = `invalid-channel-${getRandomId()}`;

        // # Type /mute with random characters
        cy.postMessage(`/mute ${invalidChannel} `);
        cy.uiWaitUntilMessagePostedIncludes('Please use the channel handle to identify channels');

        cy.getLastPostId().then((postId) => {
            // * Should return an error message
            cy.get(`#postMessageText_${postId}`).
                should('have.text', `Could not find the channel ${invalidChannel}. Please use the channel handle to identify channels.`).

                // * Channel handle links to: https://docs.mattermost.com/help/getting-started/organizing-conversations.html#naming-a-channel
                contains('a', 'channel handle').then((link) => {
                    const href = link.prop('href');
                    cy.request(href).its('allRequestResponses').then((response) => {
                        cy.wrap(response[1]['Request URL']).should('equal', 'https://docs.mattermost.com/help/getting-started/organizing-conversations.html#naming-a-channel');
                    });
                });
        });
    });

    it('MM-T2834 Slash command help stays visible for system slash command', () => {
        // # Type the rename slash command in textbox
        cy.get('#post_textbox').clear().type('/rename ');

        // # Scan inside of suggestion list
        cy.get('#suggestionList').should('exist').and('be.visible').within(() => {
            // * Verify that renaming part of rename autosuggestion is still
            // visible in the autocomplete, since [text] is same as description and title, we will check if title exists
            cy.findAllByText('[text]').first().should('exist');
        });

        // # Append Hello to /rename and hit enter
        cy.get('#post_textbox').type('Hello{enter}').wait(TIMEOUTS.HALF_SEC);
        cy.get('#post_textbox').invoke('text').should('be.empty');
    });

    it('MM-T686 /logout', () => {
        // # Type "/logout"
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type('/logout{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Ensure that the user was redirected to the login page
        cy.url().should('include', '/login');
    });
});
