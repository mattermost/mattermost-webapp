// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {UserProfile} from '@mattermost/types/users';
import {Channel, ChannelMembership, ServerChannel} from '@mattermost/types/channels';
import {Team} from '@mattermost/types/teams';
import {ServerError} from '@mattermost/types/errors';
import {Role} from '@mattermost/types/roles';

import {Client4} from 'mattermost-redux/client';
import {ChannelTypes, PreferenceTypes, RoleTypes} from 'mattermost-redux/action_types';
import * as ChannelActions from 'mattermost-redux/actions/channels';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {logError} from 'mattermost-redux/actions/errors';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getChannelByName, getUnreadChannelIds, getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamUrl, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded, loadProfilesForSidebar} from 'actions/user_actions';
import {
    getChannelsAndChannelMembersQueryString,
    ChannelsAndChannelMembersQueryResponseType,
    transformToReceivedChannelsReducerPayload,
    transformToReceivedChannelMembersReducerPayload,
    ChannelsQueryResponseType,
    getChannelsQueryString,
    CHANNELS_MAX_PER_PAGE,
    CHANNEL_MEMBERS_MAX_PER_PAGE,
    ChannelMembersQueryResponseType,
    getChannelMembersQueryString,
} from 'actions/channel_queries';

import {getHistory} from 'utils/browser_history';
import {Constants, Preferences, NotificationLevels} from 'utils/constants';
import {getDirectChannelName} from 'utils/utils';

export function openDirectChannelToUserId(userId: UserProfile['id']): ActionFunc {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const channelName = getDirectChannelName(currentUserId, userId);
        const channel = getChannelByName(state, channelName);

        if (!channel) {
            return dispatch(ChannelActions.createDirectChannel(currentUserId, userId));
        }

        trackEvent('api', 'api_channels_join_direct');
        const now = Date.now();
        const prefDirect = {
            category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW,
            name: userId,
            value: 'true',
        };
        const prefOpenTime = {
            category: Preferences.CATEGORY_CHANNEL_OPEN_TIME,
            name: channel.id,
            value: now.toString(),
        };
        const actions = [{
            type: PreferenceTypes.RECEIVED_PREFERENCES,
            data: [prefDirect],
        }, {
            type: PreferenceTypes.RECEIVED_PREFERENCES,
            data: [prefOpenTime],
        }];
        dispatch(batchActions(actions));

        dispatch(savePreferences(currentUserId, [
            {user_id: currentUserId, ...prefDirect},
            {user_id: currentUserId, ...prefOpenTime},
        ]));

        return {data: channel};
    };
}

export function openGroupChannelToUserIds(userIds: Array<UserProfile['id']>): ActionFunc {
    return async (dispatch, getState) => {
        const result = await dispatch(ChannelActions.createGroupChannel(userIds));

        if (result.error) {
            getHistory().push(getCurrentTeamUrl(getState()));
        }

        return result;
    };
}

export function loadChannelsForCurrentUser(): ActionFunc {
    return async (dispatch, getState) => {
        const state = getState();
        const unreads = getUnreadChannelIds(state);

        await dispatch(ChannelActions.fetchMyChannelsAndMembersREST(getCurrentTeamId(state)));
        for (const id of unreads) {
            const channel = getChannel(state, id);
            if (channel && channel.type === Constants.DM_CHANNEL) {
                dispatch(loadNewDMIfNeeded(channel.id));
            } else if (channel && channel.type === Constants.GM_CHANNEL) {
                dispatch(loadNewGMIfNeeded(channel.id));
            }
        }

        loadProfilesForSidebar();
        return {data: true};
    };
}

export function searchMoreChannels(term: string, showArchivedChannels: boolean): ActionFunc<Channel[], ServerError> {
    return async (dispatch, getState) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);

        if (!teamId) {
            throw new Error('No team id');
        }

        const {data, error} = await dispatch(ChannelActions.searchChannels(teamId, term, showArchivedChannels));
        if (data) {
            const myMembers = getMyChannelMemberships(state);

            // When searching public channels, only get channels user is not a member of
            const channels = showArchivedChannels ? data : (data as Channel[]).filter((c) => !myMembers[c.id]);
            return {data: channels};
        }

        return {error};
    };
}

export function autocompleteChannels(term: string, success: (channels: Channel[]) => void, error: (err: ServerError) => void): ActionFunc {
    return async (dispatch, getState) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);
        if (!teamId) {
            return {data: false};
        }

        const {data, error: err} = await dispatch(ChannelActions.autocompleteChannels(teamId, term));
        if (data && success) {
            success(data);
        } else if (err && error) {
            error({id: err.server_error_id, ...err});
        }

        return {data: true};
    };
}

export function autocompleteChannelsForSearch(term: string, success: (channels: Channel[]) => void, error: (err: ServerError) => void): ActionFunc {
    return async (dispatch, getState) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);

        if (!teamId) {
            return {data: false};
        }

        const {data, error: err} = await dispatch(ChannelActions.autocompleteChannelsForSearch(teamId, term));
        if (data && success) {
            success(data);
        } else if (err && error) {
            error({id: err.server_error_id, ...err});
        }
        return {data: true};
    };
}

export function addUsersToChannel(channelId: Channel['id'], userIds: Array<UserProfile['id']>): ActionFunc {
    return async (dispatch) => {
        try {
            const requests = userIds.map((uId) => dispatch(ChannelActions.addChannelMember(channelId, uId)));

            return await Promise.all(requests);
        } catch (error) {
            return {error};
        }
    };
}

export function unmuteChannel(userId: UserProfile['id'], channelId: Channel['id']) {
    return ChannelActions.updateChannelNotifyProps(userId, channelId, {
        mark_unread: NotificationLevels.ALL,
    });
}

export function muteChannel(userId: UserProfile['id'], channelId: Channel['id']) {
    return ChannelActions.updateChannelNotifyProps(userId, channelId, {
        mark_unread: NotificationLevels.MENTION,
    });
}

/**
 * Fetches channels and channel members with graphql and then dispatches the result to redux store.
 * @param teamId If team id is provided, only channels and channel members in that team will be fetched. Otherwise, all channels and all channel members will be fetched.
 */
export function fetchChannelsAndMembers(teamId: Team['id'] = ''): ActionFunc<{channels: ServerChannel[]; channelMembers: ChannelMembership[]}> {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);

        let channelsResponse: ChannelsQueryResponseType['data']['channels'] = [];
        let channelMembersResponse: ChannelMembersQueryResponseType['data']['channelMembers'] = [];
        let roles: Role[] = [];

        try {
            const {data: channelsAndChannelMembers, errors} = await Client4.fetchWithGraphQL<ChannelsAndChannelMembersQueryResponseType>(getChannelsAndChannelMembersQueryString(teamId));

            if (errors || !channelsAndChannelMembers) {
                throw new Error('Error returned in fetching channels and channel members of first page');
            }

            // First page of channels and channel members
            channelsResponse = [...channelsAndChannelMembers.channels];
            channelMembersResponse = [...channelsAndChannelMembers.channelMembers];

            if (channelsResponse && channelsResponse.length === CHANNELS_MAX_PER_PAGE) {
                let channelsPerPageDataLength;
                let channelsCursor = channelsResponse[CHANNELS_MAX_PER_PAGE - 1].cursor;

                do {
                    const {data: channelsPerPageResponse, errors} = await Client4.fetchWithGraphQL<ChannelsQueryResponseType>(getChannelsQueryString(channelsCursor, teamId)); // eslint-disable-line no-await-in-loop

                    if (errors) {
                        throw new Error('Error returned in fetching channels of next page');
                    } else if (!channelsPerPageResponse) {
                        break;
                    } else if (channelsPerPageResponse && channelsPerPageResponse.channels && channelsPerPageResponse.channels.length === 0) {
                        break;
                    } else {
                        channelsResponse = [...channelsResponse, ...channelsPerPageResponse.channels];

                        channelsPerPageDataLength = channelsPerPageResponse.channels.length;
                        channelsCursor = channelsPerPageResponse.channels[channelsPerPageDataLength - 1].cursor;
                    }
                } while (channelsPerPageDataLength === CHANNELS_MAX_PER_PAGE);
            }

            if (channelMembersResponse && channelMembersResponse.length === CHANNEL_MEMBERS_MAX_PER_PAGE) {
                let channelMembersPerPageDataLength;
                let channelMemberCursor = channelMembersResponse[CHANNEL_MEMBERS_MAX_PER_PAGE - 1].cursor;

                do {
                    const {data: channelMembersPerPageResponse, errors} = await Client4.fetchWithGraphQL<ChannelMembersQueryResponseType>(getChannelMembersQueryString(channelMemberCursor, teamId)); // eslint-disable-line no-await-in-loop

                    if (errors) {
                        throw new Error('Error returned in fetching channel members of next page');
                    } else if (!channelMembersPerPageResponse) {
                        break;
                    } else if (channelMembersPerPageResponse && channelMembersPerPageResponse.channelMembers && channelMembersPerPageResponse.channelMembers.length === 0) {
                        break;
                    } else {
                        channelMembersResponse = [...channelMembersResponse, ...channelMembersPerPageResponse.channelMembers];

                        channelMembersPerPageDataLength = channelMembersPerPageResponse.channelMembers.length;
                        channelMemberCursor = channelMembersPerPageResponse.channelMembers[channelMembersPerPageDataLength - 1].cursor;
                    }
                } while (channelMembersPerPageDataLength === CHANNEL_MEMBERS_MAX_PER_PAGE);
            }
        } catch (error) {
            dispatch(logError(error as ServerError, true, true));
            return {error: error as ServerError};
        }

        if (channelMembersResponse && channelMembersResponse.length > 0) {
            channelMembersResponse.forEach((channelMembers) => {
                channelMembers.roles.forEach((role) => {
                    roles = [...roles, role];
                });
            });
        }

        const channels = transformToReceivedChannelsReducerPayload(channelsResponse);
        const channelMembers = transformToReceivedChannelMembersReducerPayload(channelMembersResponse, currentUserId);

        const actions = [];
        if (teamId) {
            actions.push({
                type: ChannelTypes.RECEIVED_CHANNELS,
                teamId,
                data: channels,
            });
            actions.push({
                type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBERS,
                data: channelMembers,
            });

            actions.push({
                type: RoleTypes.RECEIVED_ROLES,
                data: roles,
            });
        } else {
            actions.push({
                type: ChannelTypes.RECEIVED_ALL_CHANNELS,
                data: channels,
            });
            actions.push({
                type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBERS,
                data: channelMembers,
            });
        }

        await dispatch(batchActions(actions));

        return {data: {channels, channelMembers, roles}};
    };
}
