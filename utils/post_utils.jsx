// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {Permissions} from 'mattermost-redux/constants';

import UserStore from 'stores/user_store.jsx';
import store from 'stores/redux_store.jsx';

import Constants from 'utils/constants.jsx';
import {formatWithRenderer} from 'utils/markdown';
import MentionableRenderer from 'utils/markdown/mentionable_renderer';
import * as Utils from 'utils/utils.jsx';

export function isSystemMessage(post) {
    return Boolean(post.type && (post.type.lastIndexOf(Constants.SYSTEM_MESSAGE_PREFIX) === 0));
}

export function fromAutoResponder(post) {
    return Boolean(post.type && (post.type === Constants.AUTO_RESPONDER));
}

export function isFromWebhook(post) {
    return post.props && post.props.from_webhook === 'true';
}

export function isPostOwner(post) {
    return UserStore.getCurrentId() === post.user_id;
}

export function isComment(post) {
    if ('root_id' in post) {
        return post.root_id !== '' && post.root_id != null;
    }
    return false;
}

export function isEdited(post) {
    return post.edit_at > 0;
}

export function getImageSrc(src, hasImageProxy) {
    if (hasImageProxy) {
        return Client4.getBaseRoute() + '/image?url=' + encodeURIComponent(src);
    }
    return src;
}

export function canDeletePost(post) {
    if (post.type === Constants.PostTypes.FAKE_PARENT_DELETED) {
        return false;
    }
    const channel = getChannel(store.getState(), post.channel_id);

    if (isPostOwner(post)) {
        return haveIChannelPermission(store.getState(), {channel: post.channel_id, team: channel && channel.team_id, permission: Permissions.DELETE_POST});
    }
    return haveIChannelPermission(store.getState(), {channel: post.channel_id, team: channel && channel.team_id, permission: Permissions.DELETE_OTHERS_POSTS});
}

export function canEditPost(post, editDisableAction) {
    if (isSystemMessage(post)) {
        return false;
    }

    let canEdit = false;
    const license = getLicense(store.getState());
    const config = getConfig(store.getState());
    const channel = getChannel(store.getState(), post.channel_id);

    const isOwner = isPostOwner(post);
    canEdit = haveIChannelPermission(store.getState(), {channel: post.channel_id, team: channel && channel.team_id, permission: Permissions.EDIT_POST});
    if (!isOwner) {
        // I only can edit my posts, at least until phase-2
        //canEdit = canEdit && haveIChannelPermission(store.getState(), {channel: post.channel_id, team: channel && channel.team_id, permission: Permissions.EDIT_OTHERS_POSTS});
        canEdit = false;
    }

    if (canEdit && license.IsLicensed === 'true') {
        if (config.PostEditTimeLimit !== '-1' && config.PostEditTimeLimit !== -1) {
            const timeLeft = (post.create_at + (config.PostEditTimeLimit * 1000)) - Utils.getTimestamp();
            if (timeLeft > 0) {
                editDisableAction.fireAfter(timeLeft + 1000);
            } else {
                canEdit = false;
            }
        }
    }

    return canEdit;
}

export function shouldShowDotMenu(post) {
    if (Utils.isMobile()) {
        return true;
    }

    if (!isSystemMessage(post)) {
        return true;
    }

    if (canDeletePost(post)) {
        return true;
    }

    if (canEditPost(post)) {
        return true;
    }

    return false;
}

export function containsAtChannel(text) {
    // Don't warn for slash commands
    if (!text || text.startsWith('/')) {
        return false;
    }

    const mentionableText = formatWithRenderer(text, new MentionableRenderer());

    return (/\B@(all|channel)\b/i).test(mentionableText);
}
