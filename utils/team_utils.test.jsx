// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {General} from 'mattermost-redux/constants';

import * as TeamUtils from 'utils/team_utils.jsx';

describe('TeamUtils.filterAndSortTeamsByDisplayName', () => {
    const teamA = {id: 'team_id_a', name: 'team-a', display_name: 'Team A', delete_at: 0};
    const teamB = {id: 'team_id_b', name: 'team-b', display_name: 'Team A', delete_at: 0};
    const teamC = {id: 'team_id_c', name: 'team-c', display_name: 'Team C', delete_at: null};
    const teamD = {id: 'team_id_d', name: 'team-d', display_name: 'Team D'};
    const teamE = {id: 'team_id_e', name: 'team-e', display_name: 'Team E', delete_at: 1};
    const teamF = {id: 'team_id_i', name: 'team-f', display_name: null};
    const teamG = null;

    test('should return correct sorted teams', () => {
        for (const data of [
            {teams: [teamG], result: []},
            {teams: [teamF, teamG], result: []},
            {teams: [teamA, teamB, teamC, teamD, teamE], result: [teamA, teamB, teamC, teamD]},
            {teams: [teamE, teamD, teamC, teamB, teamA], result: [teamA, teamB, teamC, teamD]},
            {teams: [teamA, teamB, teamC, teamD, teamE, teamF, teamG], result: [teamA, teamB, teamC, teamD]},
            {teams: [teamG, teamF, teamE, teamD, teamC, teamB, teamA], result: [teamA, teamB, teamC, teamD]},
        ]) {
            expect(TeamUtils.filterAndSortTeamsByDisplayName(data.teams, General.DEFAULT_LOCALE)).toEqual(data.result);
        }
    });

    test('should return correct sorted teams when teamsOrder is provided', () => {
        const teamsOrder = 'team_id_d,team_id_b,team_id_a,team_id_c';

        for (const data of [
            {teams: [teamG], result: []},
            {teams: [teamF, teamG], result: []},
            {teams: [teamA, teamB, teamC, teamD, teamE], result: [teamD, teamB, teamA, teamC]},
            {teams: [teamE, teamD, teamC, teamB, teamA], result: [teamD, teamB, teamA, teamC]},
            {teams: [teamA, teamB, teamC, teamD, teamE, teamF, teamG], result: [teamD, teamB, teamA, teamC]},
            {teams: [teamG, teamF, teamE, teamD, teamC, teamB, teamA], result: [teamD, teamB, teamA, teamC]},
        ]) {
            expect(TeamUtils.filterAndSortTeamsByDisplayName(data.teams, General.DEFAULT_LOCALE, teamsOrder)).toEqual(data.result);
        }
    });
});
