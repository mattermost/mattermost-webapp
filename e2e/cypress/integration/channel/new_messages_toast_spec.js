// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// # indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

const otherUser = users['user-2'];

describe('New toast message appears', () => {
    before(() => {
        cy.toMainChannelView();
        cy.visit('/ad-1/channels/saepe-5');
    });

    it('M-19433 new messages toast appears when a user posts a new message', () => {
        cy.getCurrentChannelId().as('channelId');

        // # add enough messages
        cy.get('@channelId').then((channelId) => {
            cy.postMessageAs({sender: otherUser, message: 'This is a really old message', channelId, createAt: Cypress.moment()});
            for (let index = 0; index < 30; index++) {
                cy.postMessageAs({sender: otherUser, message: `This is an old message [${index}]`, channelId, createAt: Cypress.moment()});
            }
        });

        // # mark as viewed
        cy.visit('/ad-1/channels/town-square');
        cy.visit('/ad-1/channels/saepe-5');

        // # scroll up so bottom is not visible
        cy.get('div.loading__content').scrollIntoView({duration: 1000});

        // # post a new message
        cy.get('@channelId').then((channelId) => {
            cy.postMessageAs({sender: otherUser, message: 'This is a new message', channelId, createAt: Cypress.moment()});
        });

        // # find the toast
        cy.get('div.toast').should('be.visible');

        // # check that the message is correct
        cy.get('div.toast__message>span').first().contains('1 new message');
    });
});