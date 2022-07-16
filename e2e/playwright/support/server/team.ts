// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Team, TeamType} from '@mattermost/types/lib/teams';

import {getRandomId} from '@support/utils';

export function createRandomTeam(name = 'team', displayName = 'Team', type: TeamType = 'O', unique = true): Team {
    const randomSuffix = getRandomId();

    const team = {
        name: unique ? `${name}-${randomSuffix}` : name,
        display_name: unique ? `${displayName} ${randomSuffix}` : displayName,
        type,
    };

    return team as Team;
}
