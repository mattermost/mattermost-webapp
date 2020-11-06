// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// # Indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @toast

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getRandomId} from '../../utils';

import {
    scrollDown,
    scrollUp,
    scrollUpAndPostAMessage,
    visitTownSquareAndWaitForPageToLoad,
} from './helpers';

describe('Toast', () => {
    let otherUser;
    let testTeam;
    let townsquareChannelId;

    before(() => {
        // # Build data to test and login as testUser
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;

            cy.apiGetChannelByName(testTeam.name, 'town-square').then(({channel}) => {
                townsquareChannelId = channel.id;
            });

            cy.apiCreateUser().then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiLogin(user);
                    cy.visit(`/${testTeam.name}/channels/town-square`);
                });
            });
        });
    });

    beforeEach(() => {
        // # Click on town-square then off-topic channels in LHS
        cy.get('#sidebarItem_town-square', {timeout: 60000}).should('be.visible').click();
        cy.findAllByTestId('postView').should('be.visible');
        cy.get('#sidebarItem_off-topic').should('be.visible').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify that off-topic channel is loaded
        cy.get('#channelIntro').should('be.visible').contains('Beginning of Off-Topic');
        cy.findAllByTestId('postView').should('be.visible');
    });

    it('MM-T1784_1 should see a toast with Jump to recent messages button', () => {
        // # Have a channel with more than a page of unread messages (have another user post around 30 messages)
        const randomId = getRandomId();
        const numberOfPost = 30;
        Cypress._.times(numberOfPost, (num) => {
            cy.postMessageAs({sender: otherUser, message: `${num} ${randomId}`, channelId: townsquareChannelId});
        });

        // # Switch to the channel
        visitTownSquareAndWaitForPageToLoad();

        // * Toast should be visible with jump to recent messages button
        cy.get('div.toast').should('be.visible');
        cy.get('div.toast__jump').should('be.visible');

        // * Check that the message is correct
        cy.get('div.toast__message>span').should('be.visible').first().contains(`${numberOfPost} new messages`);
        scrollDown();

        // * Should hide the scroll to new message button as it is at the bottom
        cy.get('div.toast__jump').should('not.be.visible');

        // * As time elapsed the toast should be hidden
        cy.get('div.toast').should('be.not.visible');
    });

    it('MM-T1784_2 should see a toast with number of unread messages in the toast if the bottom is not in view', () => {
        // # Switch to the test channel
        visitTownSquareAndWaitForPageToLoad();

        // # Scroll up and have another user post couple of messages
        const numberOfPost = 2;
        scrollUpAndPostAMessage(otherUser, townsquareChannelId, numberOfPost);

        // * Toast should be visible with correct message
        cy.get('div.toast').should('be.visible');
        cy.get('div.toast__message>span').should('be.visible').first().contains(`${numberOfPost} new messages`);
    });

    it('MM-T1784_3 should show the mobile view version of the toast', () => {
        visitTownSquareAndWaitForPageToLoad();
        const numberOfPost = 2;
        scrollUpAndPostAMessage(otherUser, townsquareChannelId, numberOfPost);

        // * Verify toast on desktop view
        cy.get('div.toast').should('be.visible');
        cy.get('.toast__visible').should('be.visible').within(() => {
            cy.get('.toast__jump').findAllByLabelText('Down Arrow Icon').should('be.visible');
            cy.findByText('Jump to new messages').should('be.visible');
            cy.get('.toast__message>span').should('be.visible').first().contains(`${numberOfPost} new messages today`).find('time').should('be.visible');
            cy.get('#dismissToast').should('be.visible');
        });

        // * Verify toast on mobile view
        cy.viewport('iphone-6');
        cy.get('.toast__visible').should('be.visible').within(() => {
            cy.get('.toast__jump').findAllByLabelText('Down Arrow Icon').should('be.visible');
            cy.findByText('Jump to new messages').should('not.be.visible');
            cy.get('.toast__message>span').should('be.visible').first().contains(`${numberOfPost} new messages`).find('time').should('not.exist');
            cy.get('#dismissToast').should('be.visible');
        });
    });

    it('MM-T1784_4 marking a channel as unread should reappear new message toast', () => {
        visitTownSquareAndWaitForPageToLoad();
        cy.get('div.toast').should('not.be.visible');

        // # Scroll up so bottom is not visible
        scrollUp();

        const oldPostNumber = 28;

        cy.getNthPostId(-oldPostNumber).then((postId) => {
            // # Mark post as unread
            cy.uiClickPostDropdownMenu(postId, 'Mark as Unread');

            // # Visit another channel and come back to the same channel again
            cy.get('#sidebarItem_off-topic').should('be.visible').scrollIntoView().click();
            cy.get('div.post-list__dynamic').should('be.visible');
            cy.get('#sidebarItem_town-square').should('be.visible').scrollIntoView().click();

            // # Scroll up so bottom is not visible
            scrollUp();

            // # New message toast is present with expected number of messages
            cy.get('div.toast').should('be.visible');
            cy.get('div.toast__message>span').should('be.visible').first().contains(`${oldPostNumber} new messages today`);

            const randomId = getRandomId();
            Cypress._.times(2, (num) => {
                cy.postMessageAs({sender: otherUser, message: `${num} ${randomId}`, channelId: townsquareChannelId});

                // * Count increments as new messages are posted
                cy.get('div.toast__message>span').should('be.visible').first().contains(`${oldPostNumber + num + 1} new messages today`);
            });
        });
    });

    it('MM-T1786 Dismissing the toast using Jump to', () => {
        // # Have a channel with more than a page of unread messages (have another user post around 30 messages)
        const randomId = getRandomId();
        const numberOfPost = 30;
        Cypress._.times(numberOfPost, (num) => {
            cy.postMessageAs({sender: otherUser, message: `${num} ${randomId}`, channelId: townsquareChannelId});
        });

        // # Switch to the channel
        visitTownSquareAndWaitForPageToLoad();

        // * Verify toast is visible with jump to recent messages button
        cy.get('div.toast').should('be.visible');
        cy.get('div.toast').findByText('Jump to recents').should('be.visible').click();

        // * Verify toast is not visible
        cy.get('div.toast__jump').should('not.be.visible');

        // # Scroll up on the channel
        scrollUp();

        Cypress._.times(2, (num) => {
            // # Post messages as otherUser
            cy.postMessageAs({sender: otherUser, message: `${num} ${randomId}`, channelId: townsquareChannelId});
        });

        // * Toast should be visible with jump to new messages button
        cy.get('div.toast').should('be.visible');
        cy.get('div.toast').findByText('Jump to new messages').should('be.visible');

        // # Scroll down to the bottom to read all messages
        scrollDown();

        // * Verify toast is not visible
        cy.get('div.toast').should('not.be.visible');
    });
});
