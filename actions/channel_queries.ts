// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChannelMembership, ServerChannel, ChannelType} from '@mattermost/types/channels';
import {Role} from '@mattermost/types/roles';
import {Team} from '@mattermost/types/teams';
import {UserProfile} from '@mattermost/types/users';

import {convertRolesNamesArrayToString} from 'mattermost-redux/actions/roles';

export const CHANNELS_MAX_PER_PAGE = 60;
export const CHANNEL_MEMBERS_MAX_PER_PAGE = 60;

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

const channelsFragment = `
    fragment channelsFragment on Channel {
        cursor
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
    }
`;

const channelMembersFragment = `
    fragment channelMembersFragment on ChannelMember {
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
`;

const channelsAndChannelMembersQueryString = `
    query gqlWebChannelsAndChannelMembers($teamId: String!, $maxChannelsPerPage: Int!, $maxChannelMembersPerPage: Int!) {
        channels(userId: "me", teamId: $teamId, first: $maxChannelsPerPage) {
          ...channelsFragment
        }
        channelMembers(userId: "me", teamId: $teamId, first: $maxChannelMembersPerPage) {
          ...channelMembersFragment
        }
      }

    ${channelsFragment}
    ${channelMembersFragment}
`;

/**
 * @param teamId : If empty, returns all channels and channel members across teams. Otherwise only for the specified team.
 */
export function getChannelsAndChannelMembersQueryString(teamId: Team['id'] = '') {
    return JSON.stringify({
        query: channelsAndChannelMembersQueryString,
        operationName: 'gqlWebChannelsAndChannelMembers',
        variables: {
            teamId,
            maxChannelsPerPage: CHANNELS_MAX_PER_PAGE,
            maxChannelMembersPerPage: CHANNEL_MEMBERS_MAX_PER_PAGE,
        },
    });
}

const channelsQueryString = `
query gqlWebChannels($teamId: String!, $maxChannelsPerPage: Int!, $cursor: String!) {
    channels(userId: "me", teamId: $teamId, first: $maxChannelsPerPage, after: $cursor) {
        ...channelsFragment
    }
  }

  ${channelsFragment}
`;

/**
 * @param cursor : If empty, will return the first page of channel.
 * @param teamId : If its empty, will return channel for all teams instead. Otherwise only for the specified team.
 */
export function getChannelsQueryString(cursor = '', teamId: Team['id'] = '') {
    return JSON.stringify({
        query: channelsQueryString,
        operationName: 'gqlWebChannels',
        variables: {
            teamId,
            maxChannelsPerPage: CHANNELS_MAX_PER_PAGE,
            cursor,
        },
    });
}

const channelMembersQueryString = `
query gqlWebChannelMembers($teamId: String!, $maxChannelMembersPerPage: Int!, $cursor: String!) {
    channelMembers(userId: "me", teamId: $teamId, first: $maxChannelMembersPerPage, after: $cursor) {
        ...channelMembersFragment
    }
    ${channelMembersFragment}
  }
`;

/**
 * @param cursor : If empty, will return the first page of channel members.
 * @param teamId : If its empty, will return channel members for all teams instead. Otherwise only for the specified team.
 */
export function getChannelMembersQueryString(cursor = '', teamId: Team['id'] = '') {
    return JSON.stringify({
        query: channelMembersQueryString,
        operationName: 'gqlWebChannelMembers',
        variables: {
            maxChannelMembersPerPage: CHANNEL_MEMBERS_MAX_PER_PAGE,
            cursor,
            teamId,
        },
    });
}

export function transformToReceivedChannelsReducerPayload(
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

export function transformToReceivedChannelMembersReducerPayload(
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
