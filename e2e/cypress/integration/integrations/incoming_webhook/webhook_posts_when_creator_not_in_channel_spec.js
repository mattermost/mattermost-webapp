// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @incoming_webhook

import {getRandomId} from '../../../utils';
import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Incoming webhook', () => {
    let testTeam;
    let incomingWebhook;
    let user2;
    let channel;

    before(() => {
        // # Create and visit new channel and create incoming webhook
        cy.apiInitSetup().then(({user}) => {
            cy.apiCreateUser(user2);
            cy.apiLogin(user).then(() => {
                cy.apiCreateTeam('team', 'Webhook Team').then(({team}) => {
                    testTeam = team;
                    console.log(testTeam)
                    console.log(team)

                    cy.apiCreateChannel(team.id, 'channel-test', 'Webhook Channel').then(({channel}) => {
                        channel.id = channel.id;
                        console.log(channel)
                        const newIncomingHook = {
                            channel_id: channel.id,
                            channel_locked: false,
                            description: 'Incoming webhook - setting',
                            display_name: 'webhook-setting',
                        };
                        cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                            incomingWebhook = hook;
                            const message = 'TestMessage'
                            console.log(incomingWebhook)
                            cy.postIncomingWebhook({url: incomingWebhook.url, data: message});
                        });
                        console.log(incomingWebhook)
                        cy.removeUserFromChannel(channel.id, user.id).then((res) => {
                            expect(res.status).to.equal(200);
                    });
                    cy.apiAddUserToTeam(user2).then(() => {
                        cy.apiAddUserToChannel(user2)
                    });
                        cy.apiLogin(user2);
                        cy.visit(`/${team.name}/channels/${channel.name}`);
                    });
                });
            });
        });
    });


    it('MM-T638 Webhook posts when webhook creator is not a member of the channel', () => {
            // # Post the first incoming webhook
            //const message = "Test Message"
           // cy.postIncomingWebhook({url: incomingWebhook.url, data: message});
    });
});
