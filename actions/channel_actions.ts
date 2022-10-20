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

import {browserHistory} from 'utils/browser_history';
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
            browserHistory.push(getCurrentTeamUrl(getState()));
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

        let channels: ServerChannel[] = [];
        let channelMembers: ChannelMembership[] = [];
        let roles: Role[] = [];
        try {
            const {data: channelsAndChannelMembers} = await Client4.fetchWithGraphQL<ChannelsAndChannelMembersQueryResponseType>(getChannelsAndChannelMembersQueryString(teamId));

            if ('errors' in channelsAndChannelMembers || !channelsAndChannelMembers) {
                throw new Error('No data returned from channels and channel members query');
            }

            const channelsFirstPage = transformToReceivedChannelsReducerPayload(channelsAndChannelMembers.channels);
            channels = [...channelsFirstPage];

            if (channelsAndChannelMembers && channelsAndChannelMembers.channels && channelsAndChannelMembers.channels.length === CHANNELS_MAX_PER_PAGE) {
                // cursor at the end of first page
                let channelsCursor = channelsAndChannelMembers.channels[CHANNELS_MAX_PER_PAGE - 1].cursor;
                let channelsPerPageDataLength;

                do {
                    const channelsPerPageResponse = await Client4.fetchWithGraphQL<ChannelsQueryResponseType>(getChannelsQueryString(channelsCursor, teamId)); // eslint-disable-line no-await-in-loop

                    // No more channels to fetch
                    if ('errors' in channelsPerPageResponse || !channelsPerPageResponse.data) {
                        break;
                    } else {
                        const channelsPerPage = transformToReceivedChannelsReducerPayload(channelsPerPageResponse.data.channels);
                        channels = [...channels, ...channelsPerPage];

                        const channelsPerPageData = channelsPerPageResponse.data.channels;
                        channelsPerPageDataLength = channelsPerPageData.length;

                        // cursor at the end of the page
                        channelsCursor = channelsPerPageData[channelsPerPageDataLength - 1].cursor;
                    }
                } while (channelsPerPageDataLength === CHANNELS_MAX_PER_PAGE);
            }

            const channelMembersFirstPage = transformToReceivedChannelMembersReducerPayload(channelsAndChannelMembers.channelMembers, currentUserId);
            channelMembers = [...channelMembersFirstPage];

            roles = channelsAndChannelMembers.channelMembers.flatMap((channelMembership) => channelMembership.roles);

            if (channelsAndChannelMembers && channelsAndChannelMembers.channelMembers && channelsAndChannelMembers.channelMembers.length === CHANNEL_MEMBERS_MAX_PER_PAGE) {
                let channelMemberCursor = channelsAndChannelMembers.channelMembers[CHANNEL_MEMBERS_MAX_PER_PAGE - 1].cursor;
                let channelMembersPerPageDataLength;

                do {
                    const channelMembersPerPageResponse = await Client4.fetchWithGraphQL<ChannelMembersQueryResponseType>(getChannelMembersQueryString(channelMemberCursor, teamId)); // eslint-disable-line no-await-in-loop

                    // no more channel members in next page
                    if ('errors' in channelMembersPerPageResponse || !channelMembersPerPageResponse.data) {
                        break;
                    } else {
                        const channelMembersPerPage = transformToReceivedChannelMembersReducerPayload(channelMembersPerPageResponse.data.channelMembers, currentUserId);
                        channelMembers = [...channelMembers, ...channelMembersPerPage];

                        const channelMembersPerPageData = channelMembersPerPageResponse.data.channelMembers;
                        channelMembersPerPageDataLength = channelMembersPerPageData.length;

                        const rolesInChannelMembersPerPage = channelMembersPerPageData.flatMap((channelMembership) => channelMembership.roles);
                        roles = [...roles, ...rolesInChannelMembersPerPage];

                        channelMemberCursor = channelMembersPerPageData[channelMembersPerPageDataLength - 1].cursor;
                    }
                } while (channelMembersPerPageDataLength === CHANNEL_MEMBERS_MAX_PER_PAGE);
            }
        } catch (error) {
            dispatch(logError(error as ServerError));
            return {error: error as ServerError};
        }

        const actions = [];
        if (teamId.length > 0) {
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

        return {data: {channels, channelMembers}};
    };
}
