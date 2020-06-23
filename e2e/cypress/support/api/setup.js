// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('apiInitSetup', ({loginAfter = false, userPrefix = 'user'} = {}) => {
    return cy.apiCreateTeam('team', 'Team').then((teamRes) => {
        const team = teamRes.body;

        // # Add public channel
        return cy.apiCreateChannel(team.id, 'channel', 'Channel').then((channelRes) => {
            const channel = channelRes.body;

            return cy.apiCreateUser({prefix: userPrefix}).then(({user}) => {
                return cy.apiAddUserToTeam(team.id, user.id).then(() => {
                    return cy.apiAddUserToChannel(channel.id, user.id).then(() => {
                        if (loginAfter) {
                            return cy.apiLogin(user.username, user.password).then(() => {
                                return cy.wrap({team, channel, user});
                            });
                        }

                        return cy.wrap({team, channel, user});
                    });
                });
            });
        });
    });
});
