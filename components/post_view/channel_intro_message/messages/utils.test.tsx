// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChannelType, Channel} from '@mattermost/types/channels';

import {Constants} from 'utils/constants';
import {UserProfile} from '@mattermost/types/users';

export const channel = {
    create_at: 1508265709607,
    creator_id: 'creator_id',
    delete_at: 0,
    display_name: 'test channel',
    header: 'test',
    id: 'channel_id',
    last_post_at: 1508265709635,
    name: 'testing',
    purpose: 'test',
    team_id: 'team-id',
    type: 'O',
    update_at: 1508265709607,
} as Channel;

export const archivedChannel = {
    ...channel,
    name: Constants.DEFAULT_CHANNEL,
    type: Constants.OPEN_CHANNEL as ChannelType,
    delete_at: 111111,
};

// type PluginComponent
export const boardComponent = {
    id: 'board',
    pluginId: 'board',
};

export const user1 = {id: 'user1', roles: 'system_user'};

export const users = [
    {id: 'user1', roles: 'system_user'},
    {id: 'guest1', roles: 'system_guest'},
] as UserProfile[];
