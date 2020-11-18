// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

import {getRandomId} from '../../../utils';

describe('Integrations', () => {
    let newIncomingHook;
    let incomingWebhook;
    let testChannel;
    let testTeam;
    let otherUser;

    before(() => {
        // # Create test team, channel, and webhook
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            newIncomingHook = {
                channel_id: channel.id,
                channel_locked: true,
                description: 'Test Webhook Description',
                display_name: 'Test Webhook Name',
            };
            cy.log('create a second user');
            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;
                cy.log('add this user to the team');
                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.log('add this user to the channel');
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });

            //# Create a new webhook
            cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                incomingWebhook = hook;
            });
            cy.apiLogin(user);
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T640 Cancel out of edit', () => {
        const payload = getPayload(testChannel);
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});
    });
});

function getPayload(testChannel) {
    return {
        channel: testChannel.name,
        text: `${getRandomId()} - this is from incoming webhook`,
    };
}
