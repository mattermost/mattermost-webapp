// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {Team} from '@mattermost/types/teams';
import {ServerError} from '@mattermost/types/errors';
import {ChannelMembership, ServerChannel} from '@mattermost/types/channels';

import {Client4} from 'mattermost-redux/client';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {ChannelTypes} from 'mattermost-redux/action_types';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {logError} from 'mattermost-redux/actions/errors';
import {loadRolesIfNeeded} from 'mattermost-redux/actions/roles';

import {
    getTeamsChannelsAndMembersQueryString,
    ChannelsAndChannelMembersQueryResponseType,
    getAllChannelsAndMembersQueryString,
    transformToReceivedChannelsReducerPayload,
    transformToReceivedChannelMembersReducerPayload,
} from 'actions/channel_queries';

export function fetchChannelsAndMembers(teamId: Team['id'] = ''): ActionFunc<{channels: ServerChannel[]; channelMembers: ChannelMembership[]}> {
    return async (dispatch, getState) => {
        let channelsAndMembers: ChannelsAndChannelMembersQueryResponseType['data'] | null = null;
        try {
            if (teamId) {
                const {data} = await Client4.fetchWithGraphQL<ChannelsAndChannelMembersQueryResponseType>(getTeamsChannelsAndMembersQueryString(teamId));
                channelsAndMembers = data;
            } else {
                const {data} = await Client4.fetchWithGraphQL<ChannelsAndChannelMembersQueryResponseType>(getAllChannelsAndMembersQueryString());
                channelsAndMembers = data;
            }
        } catch (error) {
            dispatch(logError(error as ServerError));
            return {error: error as ServerError};
        }

        if (!channelsAndMembers) {
            return {data: {channels: [], channelMembers: []}};
        }

        const state = getState();
        const currentUserId = getCurrentUserId(state);

        const channels = transformToReceivedChannelsReducerPayload(channelsAndMembers.channels);
        const channelMembers = transformToReceivedChannelMembersReducerPayload(channelsAndMembers.channelMembers, currentUserId);

        await dispatch(batchActions([
            {
                type: ChannelTypes.RECEIVED_ALL_CHANNELS,
                data: channels,
            },
            {
                type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBERS,
                data: channelMembers,
                currentUserId,
            },
        ]));

        // Add any pending roles for the current team's channels
        const roles = new Set<string>();
        if (teamId) {
            channelsAndMembers.channelMembers.forEach((channelMember) => {
                if (channelMember.roles && channelMember.roles.length > 0) {
                    channelMember.roles.forEach((role) => {
                        roles.add(role.name);
                    });
                }
            });

            if (roles.size > 0) {
                dispatch(loadRolesIfNeeded(roles));
            }
        }

        return {data: {channels, channelMembers}};
    };
}
