// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {General, Posts, Preferences, Permissions} from '../constants';
import {hasNewPermissions} from 'mattermost-redux/selectors/entities/general';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';

import {GlobalState} from 'mattermost-redux/types/store';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {Post, PostType, PostMetadata, PostEmbed} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';
import {Team} from 'mattermost-redux/types/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {$ID} from 'mattermost-redux/types/utilities';

import {getPreferenceKey} from './preference_utils';

export function isPostFlagged(postId: $ID<Post>, myPreferences: {
    [x: string]: PreferenceType;
}): boolean {
    const key = getPreferenceKey(Preferences.CATEGORY_FLAGGED_POST, postId);
    return myPreferences.hasOwnProperty(key);
}

export function isSystemMessage(post: Post): boolean {
    return Boolean(post.type && post.type.startsWith(Posts.SYSTEM_MESSAGE_PREFIX));
}

export function isMeMessage(post: Post): boolean {
    return Boolean(post.type && post.type === Posts.POST_TYPES.ME);
}

export function isFromWebhook(post: Post): boolean {
    return post.props && post.props.from_webhook;
}

export function isPostEphemeral(post: Post): boolean {
    return post.type === Posts.POST_TYPES.EPHEMERAL || post.type === Posts.POST_TYPES.EPHEMERAL_ADD_TO_CHANNEL || post.state === Posts.POST_DELETED;
}

export function shouldIgnorePost(post: Post, userId?: $ID<UserProfile>): boolean {
    const postTypeCheck = post.type && (post.type === Posts.POST_TYPES.ADD_TO_CHANNEL);
    const userIdCheck = post.props && post.props.addedUserId && (post.props.addedUserId === userId);
    if (postTypeCheck && userIdCheck) {
        return false;
    }
    return Posts.IGNORE_POST_TYPES.includes(post.type);
}

export function isUserActivityPost(postType: PostType): boolean {
    return Posts.USER_ACTIVITY_POST_TYPES.includes(postType);
}

export function isPostOwner(userId: $ID<UserProfile>, post: Post) {
    return userId === post.user_id;
}

export function isEdited(post: Post): boolean {
    return post.edit_at > 0;
}

export function canDeletePost(state: GlobalState, config: any, license: any, teamId: $ID<Team>, channelId: $ID<Channel>, userId: $ID<UserProfile>, post: Post, isAdmin: boolean, isSystemAdmin: boolean): boolean {
    if (!post) {
        return false;
    }

    const isOwner = isPostOwner(userId, post);

    if (hasNewPermissions(state)) {
        const canDelete = haveIChannelPermission(state, {team: teamId, channel: channelId, permission: Permissions.DELETE_POST});
        if (!isOwner) {
            return canDelete && haveIChannelPermission(state, {team: teamId, channel: channelId, permission: Permissions.DELETE_OTHERS_POSTS});
        }
        return canDelete;
    }

    // Backwards compatibility with pre-advanced permissions config settings.
    if (license.IsLicensed === 'true') {
        return (config.RestrictPostDelete === General.PERMISSIONS_ALL && (isOwner || isAdmin)) ||
            (config.RestrictPostDelete === General.PERMISSIONS_TEAM_ADMIN && isAdmin) ||
            (config.RestrictPostDelete === General.PERMISSIONS_SYSTEM_ADMIN && isSystemAdmin);
    }
    return isOwner || isAdmin;
}

export function canEditPost(state: GlobalState, config: any, license: any, teamId: $ID<Team>, channelId: $ID<Channel>, userId: $ID<UserProfile>, post: Post): boolean {
    if (!post || isSystemMessage(post)) {
        return false;
    }

    const isOwner = isPostOwner(userId, post);
    let canEdit = true;

    if (hasNewPermissions(state)) {
        const permission = isOwner ? Permissions.EDIT_POST : Permissions.EDIT_OTHERS_POSTS;
        canEdit = haveIChannelPermission(state, {team: teamId, channel: channelId, permission});
        if (license.IsLicensed === 'true' && config.PostEditTimeLimit !== '-1' && config.PostEditTimeLimit !== -1) {
            const timeLeft = (post.create_at + (config.PostEditTimeLimit * 1000)) - Date.now();
            if (timeLeft <= 0) {
                canEdit = false;
            }
        }
    } else {
        // Backwards compatibility with pre-advanced permissions config settings.
        canEdit = isOwner && config.AllowEditPost !== 'never';
        if (config.AllowEditPost === General.ALLOW_EDIT_POST_TIME_LIMIT) {
            const timeLeft = (post.create_at + (config.PostEditTimeLimit * 1000)) - Date.now();
            if (timeLeft <= 0) {
                canEdit = false;
            }
        }
    }

    return canEdit;
}

export function getLastCreateAt(postsArray: Post[]): number {
    const createAt = postsArray.map((p) => p.create_at);

    if (createAt.length) {
        return Reflect.apply(Math.max, null, createAt);
    }

    return 0;
}

const joinLeavePostTypes = [
    Posts.POST_TYPES.JOIN_LEAVE,
    Posts.POST_TYPES.JOIN_CHANNEL,
    Posts.POST_TYPES.LEAVE_CHANNEL,
    Posts.POST_TYPES.ADD_REMOVE,
    Posts.POST_TYPES.ADD_TO_CHANNEL,
    Posts.POST_TYPES.REMOVE_FROM_CHANNEL,
    Posts.POST_TYPES.JOIN_TEAM,
    Posts.POST_TYPES.LEAVE_TEAM,
    Posts.POST_TYPES.ADD_TO_TEAM,
    Posts.POST_TYPES.REMOVE_FROM_TEAM,
    Posts.POST_TYPES.COMBINED_USER_ACTIVITY,
];

// Returns true if a post should be hidden when the user has Show Join/Leave Messages disabled
export function shouldFilterJoinLeavePost(post: Post, showJoinLeave: boolean, currentUsername: string): boolean {
    if (showJoinLeave) {
        return false;
    }

    // Don't filter out non-join/leave messages
    if (joinLeavePostTypes.indexOf(post.type) === -1) {
        return false;
    }

    // Don't filter out join/leave messages about the current user
    return !isJoinLeavePostForUsername(post, currentUsername);
}

function isJoinLeavePostForUsername(post: Post, currentUsername: string): boolean {
    if (!post.props || !currentUsername) {
        return false;
    }

    if (post.user_activity_posts) {
        for (const childPost of post.user_activity_posts) {
            if (isJoinLeavePostForUsername(childPost, currentUsername)) {
                // If any of the contained posts are for this user, the client will
                // need to figure out how to render the post
                return true;
            }
        }
    }

    return post.props.username === currentUsername ||
        post.props.addedUsername === currentUsername ||
        post.props.removedUsername === currentUsername;
}

export function isPostPendingOrFailed(post: Post): boolean {
    return post.failed || post.id === post.pending_post_id;
}

export function comparePosts(a: Post, b: Post): number {
    const aIsPendingOrFailed = isPostPendingOrFailed(a);
    const bIsPendingOrFailed = isPostPendingOrFailed(b);
    if (aIsPendingOrFailed && !bIsPendingOrFailed) {
        return -1;
    } else if (!aIsPendingOrFailed && bIsPendingOrFailed) {
        return 1;
    }

    if (a.create_at > b.create_at) {
        return -1;
    } else if (a.create_at < b.create_at) {
        return 1;
    }

    return 0;
}

export function isPostCommentMention({post, currentUser, threadRepliedToByCurrentUser, rootPost}: {post: Post; currentUser: UserProfile; threadRepliedToByCurrentUser: boolean; rootPost: Post}): boolean {
    let commentsNotifyLevel = Preferences.COMMENTS_NEVER;
    let isCommentMention = false;
    let threadCreatedByCurrentUser = false;

    if (rootPost && rootPost.user_id === currentUser.id) {
        threadCreatedByCurrentUser = true;
    }
    if (currentUser.notify_props && currentUser.notify_props.comments) {
        commentsNotifyLevel = currentUser.notify_props.comments;
    }

    const notCurrentUser = post.user_id !== currentUser.id || (post.props && post.props.from_webhook);
    if (notCurrentUser) {
        if (commentsNotifyLevel === Preferences.COMMENTS_ANY && (threadCreatedByCurrentUser || threadRepliedToByCurrentUser)) {
            isCommentMention = true;
        } else if (commentsNotifyLevel === Preferences.COMMENTS_ROOT && threadCreatedByCurrentUser) {
            isCommentMention = true;
        }
    }
    return isCommentMention;
}

export function fromAutoResponder(post: Post): boolean {
    return Boolean(post.type && (post.type === Posts.SYSTEM_AUTO_RESPONDER));
}

export function getEmbedFromMetadata(metadata: PostMetadata): PostEmbed | null {
    if (!metadata || !metadata.embeds || metadata.embeds.length === 0) {
        return null;
    }

    return metadata.embeds[0];
}
