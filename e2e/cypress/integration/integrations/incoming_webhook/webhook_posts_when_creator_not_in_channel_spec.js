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
    //let user;

    before(() => {
        // # Create and visit new channel and create incoming webhook
        cy.apiInitSetup().then(({team, channel, user}) => {
            cy.apiLogin(user).then(() => {
                // # Create a new team
                cy.apiCreateTeam('team', 'Users Team').then(({team}) => {
                    testTeam = team;
                    cy.apiCreateUser().then(({user: user2}) => {
                        cy.apiAddUserToTeam(testTeam.id, user2.id);
                        cy.apiCreateChannel(team.id, 'channel-test', 'Webhook Test').then(({channel}) => {
                            webhookChannel = channel.display_name;
                            cy.apiLogin(user).then(() => {
                                const newIncomingHook = {
                                    channel_id: channel.id,
                                    channel_locked: false,
                                    description: 'Incoming webhook - setting',
                                    display_name: 'webhook-setting',
                                };
                                cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                                    incomingWebhook = hook;
                                });
                                cy.apiAddUserToChannel(user2).then(() => {
                                    cy.apiAdminLogin().then(() => {
                                        cy.apiDeleteUserFromTeam(user);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('MM-T638 Webhook posts when webhook creator is not a member of the channel', () => {
            // # Post the first incoming webhook
            const message = "Test Message"
            cy.postIncomingWebhook({url: incomingWebhook.url, data: message});

            cy.visit(`/${team.name}/channels/${channel.name}`);

    });
});

