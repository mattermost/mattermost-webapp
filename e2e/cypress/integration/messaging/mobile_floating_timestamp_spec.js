// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// import * as TIMEOUTS from '../../fixtures/timeouts';
import users from '../../fixtures/users.json';
const sysadmin = users.sysadmin;

function generateMessages (channelId, startDate, numberOfMessages) {
    let messageNumber = 1;

    while (messageNumber <= numberOfMessages) {
        cy.postMessageAs({
            sender: sysadmin, 
            message: `Hello from: ${Cypress.moment(messageDate).format('dddd')}! Nisi reprehenderit nulla ad officia pariatur non dolore laboris irure cupidatat laborum.`, 
            channelId: channelId, 
            createAt: messageDate
        });

        messageNumber++;
    }
}

describe('Floating timestamp', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // });
        cy.viewport('iphone-6');

        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Post a message to force next user message to display a message
        cy.getCurrentChannelId().then((channelId) => {
            // # Generate messages
            generateMessages(channelId, Cypress.moment().subtract(3, 'days').valueOf(), 10);
            // get 3 day old message
            // generateMessages(channelId, Cypress.moment().subtract(3, 'days').valueOf(), 5);
            // generateMessages(channelId, Cypress.moment().subtract(2, 'days').valueOf(), 5);
            // // get 2 day old message
            // generateMessages(channelId, Cypress.moment().subtract(2, 'days').valueOf(), 5);
            // generateMessages(channelId, Cypress.moment().subtract(1, 'days').valueOf(), 5);
            // // get 1 day old message
            // generateMessages(channelId, Cypress.moment().subtract(1, 'days').valueOf(), 5);
        });
    });

    it('M18759 Floating timestamp in mobile view', () => {
        // # Find the post list
        cy.get('#post-list')
    });
});