// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Team} from 'mattermost-redux/types/teams';
import {IDMappedObjects, Dictionary} from 'mattermost-redux/types/utilities';
import {General} from '../constants';

export function teamListToMap(teamList: Team[]): IDMappedObjects<Team> {
    const teams: Dictionary<Team> = {};
    for (let i = 0; i < teamList.length; i++) {
        teams[teamList[i].id] = teamList[i];
    }
    return teams;
}

export function sortTeamsWithLocale(locale: string): (a: Team, b: Team) => number {
    return (a: Team, b: Team): number => {
        if (a.display_name !== b.display_name) {
            return a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase(), locale || General.DEFAULT_LOCALE, {numeric: true});
        }

        return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), locale || General.DEFAULT_LOCALE, {numeric: true});
    };
}

export function filterTeamsStartingWithTerm(teams: Team[], term: string): Team[] {
    const lowercasedTerm = term.toLowerCase();

    return teams.filter((team: Team) => {
        if (!team) {
            return false;
        }

        const name = team.name?.toLowerCase();
        const displayName = team.display_name?.toLowerCase();

        return name.startsWith(lowercasedTerm) ||
            displayName.startsWith(lowercasedTerm);
    });
}
