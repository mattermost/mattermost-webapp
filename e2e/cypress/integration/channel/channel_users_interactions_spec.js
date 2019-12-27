// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
import users from '../../fixtures/users.json';

const receiver = users['user-1'];
const sender = users['user-2'];

let townsquareChannelId;

describe('Channel users interactions', () => {
    before(() => {
        cy.apiLogin(receiver.username);

        cy.visit('/ad-1/channels/town-square');
        cy.getCurrentChannelId().then((id) => {
            townsquareChannelId = id;
        });
    });

    it('M17454 Scroll to bottom when sending a message', () => {
        // # Go to test channel A on sidebar
        cy.visit('/ad-1/channels/off-topic');

        // # post message in channel B by another user
        const message = 'I\'m messaging!\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2\n2';
        cy.postMessageAs({sender, message, channelId: townsquareChannelId});

        // # return back channel where is a post
        cy.get('#sidebarItem_town-square').click({force: true});

        // * check that separator with message visible
        cy.findByTestId('NotificationSeparator').
            find('span').
            should('be.visible').
            and('have.text', 'New Messages');

        // # post message on current channel
        cy.get('#post_textbox').clear().type('message123{enter}');

        // * verify that last posted message is visible
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.text', 'message123');
        });
    });
});
