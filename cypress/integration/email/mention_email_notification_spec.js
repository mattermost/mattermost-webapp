// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

import users from '../../fixtures/users.json';

const cypressConfig = require('../../../cypress.json');

const user1 = users['user-1'];
const user2 = users['user-2'];

const text = `@${user2.username}`;

describe('Email notification', () => {
    it('post a message that mentions a user', () => {
        cy.apiLogin('user-1');
        cy.visit('/');
        cy.postMessage(`${text}{enter}`);
    });

    it('sends email notification with correct email contents', () => {
        cy.visit(`${cypressConfig.localEmailUrl}`);
        cy.url().should('include', `${cypressConfig.localEmailUrl}`);

        verifyEmailNotification('eligendi', 'Town Square', user2, user1, text);
    });
});

function verifyEmailNotification(teamName, channelDisplayName, mentionedUser, byUser, message, feedbackEmail = 'test@example.com') {
    const isoDate = new Date().toISOString().substring(0, 10);

    const emailName = mentionedUser.emailname || mentionedUser.username;

    // # Visit local email provider and go directly to a user
    cy.visit(`${cypressConfig.localEmailUrl}/mailbox?name=${emailName}`);

    // # Click the most recent message
    cy.get('#message-list').children().last().click();

    // * Verify text contents of email header
    cy.get('.panel-body').should('be.visible').within(() => {
        cy.get('dl dt').first().should('have.text', 'From:');
        cy.get('dl dd').first().should('have.text', `<${feedbackEmail}>`);

        cy.get('dl dt').eq(1).should('have.text', 'To:');
        cy.get('dl dd').eq(1).should('contain', `<${mentionedUser.email}>`);

        cy.get('dl dt').eq(2).should('have.text', 'Date:');
        cy.get('dl dd').eq(2).should('contain', `${isoDate}`);

        cy.get('dl dt').last().should('have.text', 'Subject:');
        cy.get('dl dd').last().should('contain', `[Mattermost] Notification in ${teamName}`);
    });

    // * Verify text contents of email body
    cy.get('.message-body').
        should('contain', 'You have a new notification.').
        and('contain', `@${byUser.username}`).
        and('contain', `Channel: ${channelDisplayName}`).
        and('contain', `${message}`).
        and('contain', 'Go To Post').
        and('contain', 'To change your notification preferences, log in to your team site and go to Account Settings > Notifications.');
}
