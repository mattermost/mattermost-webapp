// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChannelMembership, ServerChannel, ChannelType} from '@mattermost/types/channels';
import {Role} from '@mattermost/types/roles';
import {Team} from '@mattermost/types/teams';
import {UserProfile} from '@mattermost/types/users';

import {
    convertRolesNamesArrayToString,
} from 'mattermost-redux/actions/users_queries';

export const CHANNELS_MAX_PER_PAGE = 80;
export const CHANNEL_MEMBERS_MAX_PER_PAGE = 80;

enum ChannelQueriessOperationNames {
    allChannelAndMembers = 'gqlWebAllChannelsAndChannelMembers',
    teamsChannelAndMembers = 'gqlWebTeamsChannelsAndChannelMembers',
    nextChannels = 'gqlWebNextChannels',
    nextTeamChannels = 'gqlWebNextTeamsChannels',
    nextChannelMembers = 'gqlWebNextChannelMembers',
    nextTeamChannelMembers = 'gqlWebNextTeamsChannelMembers'
}

type Cursor = {
    cursor: string;
}

export type ChannelsQueryResponseType = {
    data: {
        channels: Array<Omit<ServerChannel, 'team_id'> & {
            team: Team;
        } & Cursor>;
    };
};

export type ChannelMembersQueryResponseType = {
    data: {
        channelMembers: Array<Omit<ChannelMembership, 'channel_id | user_id | roles | post_root_id'> & {
            channel: ServerChannel;
            roles: Role[];
        } & Cursor>;
    };
};

export type ChannelsAndChannelMembersQueryResponseType = {
    data: {
        channels: ChannelsQueryResponseType['data']['channels'];
        channelMembers: ChannelMembersQueryResponseType['data']['channelMembers'];
    };
}

function makeChannelsAndMembersQueryString(
    operationName: ChannelQueriessOperationNames,
    teamId: Team['id'] = '',
) {
    return `
    query ${operationName} {
        channels(userId: "me", teamId: "${teamId}", first: ${CHANNELS_MAX_PER_PAGE}) {
          id
          create_at: createAt
          update_at: updateAt
          delete_at: deleteAt
          team {
            id
          }
          type
          display_name: displayName
          name
          header
          purpose
          last_post_at: lastPostAt
          last_root_post_at: lastRootPostAt
          total_msg_count: totalMsgCount
          total_msg_count_root: totalMsgCountRoot
          creator_id: creatorId
          scheme_id: schemeId
          group_constrained: groupConstrained
          shared
          props
          policy_id: policyId
          cursor
        }
        channelMembers(userId: "me", teamId: "${teamId}", first: ${CHANNEL_MEMBERS_MAX_PER_PAGE}) {
          cursor
          channel {
            id
          }
          roles {
            id
            name
            permissions
          }
          last_viewed_at: lastViewedAt
          msg_count: msgCount
          msg_count_root: msgCountRoot
          mention_count: mentionCount
          mention_count_root: mentionCountRoot
          notify_props: notifyProps
          last_update_at: lastUpdateAt
          scheme_admin: schemeAdmin
          scheme_user: schemeUser
        }
      }
`;
}

export function getAllChannelsAndMembersQueryString() {
    return JSON.stringify({
        query: makeChannelsAndMembersQueryString(ChannelQueriessOperationNames.allChannelAndMembers),
        operationName: ChannelQueriessOperationNames.allChannelAndMembers,
    });
}

export function getTeamsChannelsAndMembersQueryString(teamId: Team['id']) {
    return JSON.stringify({
        query: makeChannelsAndMembersQueryString(ChannelQueriessOperationNames.teamsChannelAndMembers, teamId),
        operationName: ChannelQueriessOperationNames.teamsChannelAndMembers,
    });
}

function makeChannelsNextQueryString(
    operationName: ChannelQueriessOperationNames,
    cursor: string,
    teamId: Team['id'] = '',
) {
    return `query ${operationName} {
    channels(userId: "me", teamId: "${teamId}", first: ${CHANNELS_MAX_PER_PAGE}, after: "${cursor}") {
        id
        create_at: createAt
        update_at: updateAt
        delete_at: deleteAt
        team {
          id
        }
        type
        display_name: displayName
        name
        header
        purpose
        last_post_at: lastPostAt
        last_root_post_at: lastRootPostAt
        total_msg_count: totalMsgCount
        total_msg_count_root: totalMsgCountRoot
        creator_id: creatorId
        scheme_id: schemeId
        group_constrained: groupConstrained
        shared
        props
        policy_id: policyId
        cursor
    }
  }
`;
}

export function getAllChannelsNextQueryString(cursor: string) {
    return JSON.stringify({
        query: makeChannelsNextQueryString(ChannelQueriessOperationNames.nextChannels, cursor),
        operationName: ChannelQueriessOperationNames.nextChannels,
    });
}

export function getTeamsChannelsNextQueryString(teamId: Team['id'], cursor: string) {
    return JSON.stringify({
        query: makeChannelsNextQueryString(ChannelQueriessOperationNames.nextTeamChannels, cursor, teamId),
        operationName: ChannelQueriessOperationNames.nextTeamChannels,
    });
}

function makeChannelMembersNextQueryString(
    operationName: ChannelQueriessOperationNames,
    cursor: string,
    teamId: Team['id'] = '',
) {
    return `query ${operationName} {
    channelMembers(userId: "me", teamId: "${teamId}", first: ${CHANNEL_MEMBERS_MAX_PER_PAGE}, after: "${cursor}") {
        cursor
        channel {
          id
        }
        roles {
          id
          name
          permissions
        }
        last_viewed_at: lastViewedAt
        msg_count: msgCount
        msg_count_root: msgCountRoot
        mention_count: mentionCount
        mention_count_root: mentionCountRoot
        notify_props: notifyProps
        last_update_at: lastUpdateAt
        scheme_admin: schemeAdmin
        scheme_user: schemeUser
    }
  }
`;
}

export function getAllChannelMembersNextQueryString(cursor: string) {
    return JSON.stringify({
        query: makeChannelMembersNextQueryString(ChannelQueriessOperationNames.nextChannelMembers, cursor),
        operationName: ChannelQueriessOperationNames.nextChannelMembers,
    });
}

export function getTeamsChannelMembersNextQueryString(teamId: Team['id'], cursor: string) {
    return JSON.stringify({
        query: makeChannelMembersNextQueryString(ChannelQueriessOperationNames.nextTeamChannelMembers, cursor, teamId),
        operationName: ChannelQueriessOperationNames.nextTeamChannelMembers,
    });
}

export function transformToRecievedChannelsReducerPayload(
    channels: Partial<ChannelsQueryResponseType['data']['channels']>,
): ServerChannel[] {
    return channels.map((channel) => ({
        id: channel?.id ?? '',
        create_at: channel?.create_at ?? 0,
        update_at: channel?.update_at ?? 0,
        delete_at: channel?.delete_at ?? 0,
        team_id: channel?.team?.id ?? '',
        type: channel?.type ?? '' as ChannelType,
        display_name: channel?.display_name ?? '',
        name: channel?.name ?? '',
        header: channel?.header ?? '',
        purpose: channel?.purpose ?? '',
        last_post_at: channel?.last_post_at ?? 0,
        last_root_post_at: channel?.last_root_post_at ?? 0,
        total_msg_count: channel?.total_msg_count ?? 0,
        total_msg_count_root: channel?.total_msg_count_root ?? 0,
        creator_id: channel?.creator_id ?? '',
        scheme_id: channel?.scheme_id ?? '',
        group_constrained: channel?.group_constrained ?? false,
        shared: channel?.shared ?? undefined,
        props: channel && channel.props ? {...channel.props} : undefined,
        policy_id: channel?.policy_id ?? null,
    }));
}

export function transformToRecievedChannelMembersReducerPayload(
    channelMembers: Partial<
    ChannelMembersQueryResponseType['data']['channelMembers']
    >,
    userId: UserProfile['id'],
): ChannelMembership[] {
    return channelMembers.map((channelMember) => ({
        channel_id: channelMember?.channel?.id ?? '',
        user_id: userId,
        roles: convertRolesNamesArrayToString(channelMember?.roles ?? []),
        last_viewed_at: channelMember?.last_viewed_at ?? 0,
        msg_count: channelMember?.msg_count ?? 0,
        msg_count_root: channelMember?.msg_count_root ?? 0,
        mention_count: channelMember?.mention_count ?? 0,
        mention_count_root: channelMember?.mention_count_root ?? 0,
        notify_props:
            channelMember && channelMember.notify_props ? {...channelMember.notify_props} : {},
        last_update_at: channelMember?.last_update_at ?? 0,
        scheme_admin: channelMember?.scheme_admin ?? false,
        scheme_user: channelMember?.scheme_user ?? false,
    }));
}
