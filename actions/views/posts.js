// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as PostActions from 'mattermost-redux/actions/posts';

import {Permissions} from 'mattermost-redux/constants';
import {logError} from 'mattermost-redux/actions/errors';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {haveIChannelPermission, haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getAssociatedGroupsForReferenceByMention} from 'mattermost-redux/selectors/entities/groups';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import * as Utils from 'utils/utils';
import {getSiteURL} from 'utils/url';
import {containsAtChannel, groupsMentionedInText} from 'utils/post_utils';
import {ActionTypes, AnnouncementBarTypes} from 'utils/constants';

import {runMessageWillBePostedHooks} from '../hooks';
import {getChannel} from 'mattermost-redux/actions/channels';

export function editPost(post) {
    return async (dispatch, getState) => {
        const result = await PostActions.editPost(post)(dispatch, getState);

        // Send to error bar if it's an edit post error about time limit.
        if (result.error && result.error.server_error_id === 'api.post.update_post.permissions_time_limit.app_error') {
            dispatch(logError({type: AnnouncementBarTypes.ANNOUNCEMENT, message: result.error.message}, true));
        }

        return result;
    };
}

export function forwardPost(post, channelId, message = '') {
    return async (dispatch, getState) => {
        const state = getState();

        const currentUserId = getCurrentUserId(state);
        const currentTeam = getCurrentTeam(state);
        const currentChannel = getCurrentChannel(state);
        const channel = getChannel(channelId);

        const relativePermaLink = Utils.getPermalinkURL(state, currentTeam.id, post.id);
        const permaLink = `${getSiteURL()}${relativePermaLink}`;

        const license = getLicense(state);
        const isLDAPEnabled = license?.IsLicensed === 'true' && license?.LDAPGroups === 'true';
        const useLDAPGroupMentions = isLDAPEnabled && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);
        const useChannelMentions = haveIChannelPermission(state, channel.team_id, channelId, Permissions.USE_CHANNEL_MENTIONS);
        const useCustomGroupMentions = isCustomGroupsEnabled(state) && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);
        const groupsWithAllowReference = useLDAPGroupMentions || useCustomGroupMentions ? getAssociatedGroupsForReferenceByMention(state, currentTeam.id, currentChannel.id) : null;

        let newPost = {};

        newPost.channel_id = channelId;

        const time = Utils.getTimestamp();
        const userId = currentUserId;

        newPost.message = message ? `${message}\n${permaLink}` : permaLink;
        newPost.pending_post_id = `${userId}:${time}`;
        newPost.user_id = userId;
        newPost.create_at = time;
        newPost.metadata = {};
        newPost.props = {};

        if (!useChannelMentions && containsAtChannel(newPost.message, {checkAllMentions: true})) {
            newPost.props.mentionHighlightDisabled = true;
        }

        if (!useLDAPGroupMentions && !useCustomGroupMentions && groupsMentionedInText(newPost.message, groupsWithAllowReference)) {
            newPost.props.disable_group_highlight = true;
        }

        const hookResult = await dispatch(runMessageWillBePostedHooks(newPost));

        if (hookResult.error) {
            return hookResult;
        }

        newPost = hookResult.data;

        const result = await dispatch(PostActions.createPost(newPost, []));

        // Send to error bar if it's an edit post error about time limit.
        if (result.error && result.error.server_error_id === 'api.post.update_post.permissions_time_limit.app_error') {
            dispatch(logError({type: AnnouncementBarTypes.ANNOUNCEMENT, message: result.error.message}, true));
        }

        return result;
    };
}

export function selectAttachmentMenuAction(postId, actionId, cookie, dataSource, text, value) {
    return async (dispatch) => {
        dispatch({
            type: ActionTypes.SELECT_ATTACHMENT_MENU_ACTION,
            data: {
                postId,
                actions: {
                    [actionId]: {
                        text,
                        value,
                    },
                },
            },
        });

        dispatch(PostActions.doPostActionWithCookie(postId, actionId, cookie, value));

        return {data: true};
    };
}
