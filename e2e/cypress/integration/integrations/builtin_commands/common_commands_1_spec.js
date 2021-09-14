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

import {verifyEphemeralMessage} from './helper';

describe('Integrations', () => {
    let testUser;
    let otherUser;
    let testTeam;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;

            cy.apiCreateUser({prefix: 'other'}).then((out) => {
                otherUser = out.user;

                cy.apiAddUserToTeam(team.id, otherUser.id);
            });

            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        cy.get('#sidebarItem_town-square').click();
        cy.get('#post_textbox').should('be.visible');
    });

    it('MM-T573 / autocomplete list can scroll', () => {
        // # Clear post textbox
        cy.get('#post_textbox').clear().type('/');

        // * Suggestion list should be visible
        // # Scroll to bottom and verify that the last command "/shrug" is visible
        cy.get('#suggestionList', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').scrollTo('bottom').then((container) => {
            cy.contains('/away', {container}).should('not.be.visible');
            cy.contains('/shrug [message]', {container}).should('be.visible');
        });

        // # Scroll to top and verify that the first command "/away" is visible
        cy.get('#suggestionList').scrollTo('top').then((container) => {
            cy.contains('/away', {container}).should('be.visible');
            cy.contains('/shrug [message]', {container}).should('not.be.visible');
        });
    });

    it('MM-T678 /code', () => {
        const message = '1. Not a list item, **not bolded**, http://notalink.com, ~off-topic is not a link to the channel.';

        // # Use "/code"
        cy.postMessage(`/code ${message} `);

        // * Verify that that markdown isn't rendered
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', testUser.username);
            cy.get(`#postMessageText_${postId}`).get('code').should('have.text', message);
        });

        // # Type "/code" with no text
        cy.postMessage('/code ');

        // * Verify that an error message is shown
        verifyEphemeralMessage('A message must be provided with the /code command.');
    });

    it('MM-T679 /echo', () => {
        const message = getRandomId();

        // # Type "/echo message 3"
        cy.postMessage(`/echo ${message} 3`);

        // * Verify that post is not shown after 1 second
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.not.text', message);
        });

        // * Verify that message is posted after 3 seconds
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', testUser.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', message);
        });
    });

    it('MM-T680 /help', () => {
        cy.visit('/', {
            onLoad: (win) => {
                cy.stub(win, 'open');
            },
        });

        // # Type "/help"
        cy.postMessage('/help ');

        // * Verify that a new tag opens
        cy.window().its('open').should('have.been.calledWithMatch', 'https://about.mattermost.com/default-help/');
    });

    it('MM-T681 /invite_people error message with no text or text that is not an email address', () => {
        // # Type "/invite_people 123"
        cy.postMessage('/invite_people 123');

        // * Verify the message is shown saying "Please specify one or more valid email addresses"
        verifyEphemeralMessage('Please specify one or more valid email addresses');
    });

    it('MM-T682 /leave', () => {
        // # Go to Off-Topic
        cy.visit(`${testTeam.name}/channels/off-topic`);

        // # Type "/leave"
        cy.postMessage('/leave ');

        // * Verity Off-Topic is not shown in LHS
        cy.get('#sidebar-left').should('be.visible').should('not.contain', 'Off-Topic');

        // * Verify user is redirected to Town Square
        cy.uiGetLhsSection('CHANNELS').find('.active').should('contain', 'Town Square');
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
    });

    it('MM-T574 /shrug test', () => {
        // # Login as otherUser and post a message
        cy.getCurrentChannelId().then((channelId) => {
            cy.postMessageAs({sender: otherUser, message: 'hello from otherUser', channelId});
        });

        const message = getRandomId();

        // # Post "/shrug test" as testUser
        cy.postMessage(`/shrug ${message} `);

        // * Verify that it posted message as expected from testUser
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', testUser.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', `${message} ¯\\_(ツ)_/¯`);
        });

        // * Login as otherUser and verify that it read the same message as expected from testUser
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', testUser.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', `${message} ¯\\_(ツ)_/¯`);
        });
    });
});
