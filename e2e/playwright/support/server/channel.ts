// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../utils';
import {ChannelType} from '../../../../packages/mattermost-redux/src/types/channels';

export function createRandomChannel(
    teamId,
    name,
    displayName,
    type: ChannelType = 'O',
    purpose = '',
    header = '',
    unique = true
) {
    const randomSuffix = getRandomId();

    return {
        team_id: teamId,
        name: unique ? `${name}-${randomSuffix}` : name,
        display_name: unique ? `${displayName} ${randomSuffix}` : displayName,
        type,
        purpose,
        header,
    };
}
