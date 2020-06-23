// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('utilResetTeamsAndChannels', (fullReset = true) => {
    // # Check if default "ad-1" team is present, and
    // # create if not found.
    const defaultTeamName = 'ad-1';
    cy.apiGetTeams().then((teamsRes) => {
        const teams = teamsRes.body;
        const defaultTeam = teams && teams.length > 0 && teams.find((team) => team.name === defaultTeamName);

        if (!defaultTeam) {
            cy.apiCreateTeam(defaultTeamName, 'eligendi', 'O', false);
        } else if (defaultTeam && fullReset) {
            teams.forEach((team) => {
                if (team.name !== defaultTeamName) {
                    cy.apiDeleteTeam(team.id);
                }
            });

            cy.apiGetChannelsForUser('me', defaultTeam.id).then((channelsRes) => {
                const channels = channelsRes.body;

                channels.forEach((channel) => {
                    if (
                        (channel.team_id === defaultTeam.id || channel.team_name === defaultTeam.name) &&
                        (channel.name !== 'town-square' && channel.name !== 'off-topic')
                    ) {
                        cy.apiDeleteChannel(channel.id);
                    }
                });
            });
        }
    });
}); 