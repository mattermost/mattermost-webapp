// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('apiInitSetup', ({
    loginAfter = false,
    promoteNewUserAsAdmin = false,
    userPrefix,
    teamPrefix = {name: 'team', displayName: 'Team'},
    channelPrefix = {name: 'channel', displayName: 'Channel'},
} = {}) => {
    let customAdmin;
    cy.get('@customAdmin').then(({user}) => {
        customAdmin = user;
    });

    return cy.apiCreateTeam(teamPrefix.name, teamPrefix.displayName).then(({team}) => {
        // # Add public channel
        return cy.apiCreateChannel(team.id, channelPrefix.name, channelPrefix.displayName).then(({channel}) => {
            return cy.apiCreateUser({prefix: userPrefix || (promoteNewUserAsAdmin ? 'admin' : 'user')}).then(({user}) => {
                if (promoteNewUserAsAdmin) {
                    cy.apiPatchUserRoles(user.id, ['system_admin', 'system_user']);
                }

                return cy.apiAddUserToTeam(team.id, user.id).then(() => {
                    return cy.apiAddUserToChannel(channel.id, user.id).then(() => {
                        const getUrl = (channelName) => `/${team.name}/channels/${channelName}`;

                        const data = {
                            customAdmin,
                            channel,
                            team,
                            user,
                            channelUrl: getUrl(channel.name),
                            offTopicUrl: getUrl('off-topic'),
                            townSquareUrl: getUrl('town-square'),
                        };

                        if (loginAfter) {
                            return cy.apiLogin(user).then(() => {
                                return cy.wrap(data);
                            });
                        }

                        return cy.wrap(data);
                    });
                });
            });
        });
    });
});
