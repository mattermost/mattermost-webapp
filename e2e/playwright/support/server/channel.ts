// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '@support/utils';
import {Channel, ChannelType} from '@mattermost/types/lib/channels';

export function createRandomChannel(
    teamId,
    name,
    displayName,
    type: ChannelType = 'O',
    purpose = '',
    header = '',
    unique = true
): Channel {
    const randomSuffix = getRandomId();

    const channel = {
        team_id: teamId,
        name: unique ? `${name}-${randomSuffix}` : name,
        display_name: unique ? `${displayName} ${randomSuffix}` : displayName,
        type,
        purpose,
        header,
    };

    return channel as Channel;
}
