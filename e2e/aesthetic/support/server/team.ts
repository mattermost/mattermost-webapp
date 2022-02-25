// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../utils';
import {TeamType} from '../../../../packages/mattermost-redux/src/types/teams';

export function createRandomTeam(name = 'team', displayName = 'Team', type: TeamType = 'O', unique = true) {
    const randomSuffix = getRandomId();

    return {
        name: unique ? `${name}-${randomSuffix}` : name,
        display_name: unique ? `${displayName} ${randomSuffix}` : displayName,
        type,
    };
}
