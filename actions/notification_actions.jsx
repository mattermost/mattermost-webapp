// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import semver from 'semver';
import {logError} from 'mattermost-redux/actions/errors';
import {getProfilesByIds} from 'mattermost-redux/actions/users';
import {getCurrentChannel, getMyChannelMember, makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId, getCurrentUser, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {isSystemMessage} from 'mattermost-redux/utils/post_utils';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {browserHistory} from 'utils/browser_history';
import Constants, {NotificationLevels, UserStatuses} from 'utils/constants';
import {showNotification} from 'utils/notifications';
import {isDesktopApp, isMacApp, isMobileApp, isWindowsApp} from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';
import {stripMarkdown} from 'utils/markdown';

const NOTIFY_TEXT_MAX_LENGTH = 50;

export function sendDesktopNotification(post, msgProps) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);

        if ((currentUserId === post.user_id && post.props.from_webhook !== 'true')) {
            return;
        }

        if (isSystemMessage(post)) {
            return;
        }

        let userFromPost = getUser(state, post.user_id);
        if (!userFromPost) {
            const missingProfileResponse = await dispatch(getProfilesByIds([post.user_id]));
            if (missingProfileResponse.data && missingProfileResponse.data.length) {
                userFromPost = missingProfileResponse.data[0];
            }
        }

        let mentions = [];
        if (msgProps.mentions) {
            mentions = JSON.parse(msgProps.mentions);
        }
        const teamId = msgProps.team_id;

        let channel = makeGetChannel()(state, post.channel_id);
        const user = getCurrentUser(state);
        const userStatus = getStatusForUserId(state, user.id);
        const member = getMyChannelMember(state, post.channel_id);

        if (!member || isChannelMuted(member) || userStatus === UserStatuses.DND || userStatus === UserStatuses.OUT_OF_OFFICE) {
            return;
        }

        let notifyLevel = member && member.notify_props ? member.notify_props.desktop : NotificationLevels.DEFAULT;
        if (notifyLevel === NotificationLevels.DEFAULT) {
            notifyLevel = user && user.notify_props ? user.notify_props.desktop : NotificationLevels.ALL;
        }

        if (notifyLevel === NotificationLevels.NONE) {
            return;
        } else if (notifyLevel === NotificationLevels.MENTION && mentions.indexOf(user.id) === -1 && msgProps.channel_type !== Constants.DM_CHANNEL) {
            return;
        }

        const config = getConfig(state);
        let username = '';
        if (post.props.override_username && config.EnablePostUsernameOverride === 'true') {
            username = post.props.override_username;
        } else if (userFromPost) {
            username = displayUsername(userFromPost, getTeammateNameDisplaySetting(state), false);
        } else {
            username = Utils.localizeMessage('channel_loader.someone', 'Someone');
        }

        let title = Utils.localizeMessage('channel_loader.posted', 'Posted');
        if (!channel) {
            title = msgProps.channel_display_name;
            channel = {
                name: msgProps.channel_name,
                type: msgProps.channel_type,
            };
        } else if (channel.type === Constants.DM_CHANNEL) {
            title = Utils.localizeMessage('notification.dm', 'Direct Message');
        } else {
            title = channel.display_name;
        }

        if (title === '') {
            if (msgProps.channel_type === Constants.DM_CHANNEL) {
                title = Utils.localizeMessage('notification.dm', 'Direct Message');
            } else {
                title = msgProps.channel_display_name;
            }
        }

        let notifyText = post.message;

        const msgPropsPost = JSON.parse(msgProps.post);
        const attachments = msgPropsPost && msgPropsPost.props && msgPropsPost.props.attachments ? msgPropsPost.props.attachments : [];
        let image = false;
        attachments.forEach((attachment) => {
            if (notifyText.length === 0) {
                notifyText = attachment.fallback ||
                    attachment.pretext ||
                    attachment.text;
            }
            image |= attachment.image_url.length > 0;
        });

        let strippedMarkdownNotifyText = stripMarkdown(notifyText);
        if (strippedMarkdownNotifyText.length > NOTIFY_TEXT_MAX_LENGTH) {
            strippedMarkdownNotifyText = strippedMarkdownNotifyText.substring(0, NOTIFY_TEXT_MAX_LENGTH - 1) + '...';
        }

        let body = `@${username}`;
        if (strippedMarkdownNotifyText.length === 0) {
            if (msgProps.image) {
                body += Utils.localizeMessage('channel_loader.uploadedImage', ' uploaded an image');
            } else if (msgProps.otherFile) {
                body += Utils.localizeMessage('channel_loader.uploadedFile', ' uploaded a file');
            } else if (image) {
                body += Utils.localizeMessage('channel_loader.postedImage', ' posted an image');
            } else {
                body += Utils.localizeMessage('channel_loader.something', ' did something new');
            }
        } else {
            body += `: ${strippedMarkdownNotifyText}`;
        }

        //Play a sound if explicitly set in settings
        const sound = !user.notify_props || user.notify_props.desktop_sound === 'true';

        // Notify if you're not looking in the right channel or when
        // the window itself is not active
        const activeChannel = getCurrentChannel(state);
        const channelId = channel ? channel.id : null;
        const notify = (activeChannel && activeChannel.id !== channelId) || !state.views.browser.focused;
        const soundName = user.notify_props !== undefined && user.notify_props.desktop_notification_sound !== undefined ? user.notify_props.desktop_notification_sound : 'None';

        if (notify) {
            dispatch(notifyMe(title, body, channel, teamId, !sound, soundName));

            //Don't add extra sounds on native desktop clients
            if (sound && !isWindowsApp() && !isMacApp() && !isMobileApp()) {
                Utils.ding(soundName);
            }
        }
    };
}

const notifyMe = (title, body, channel, teamId, silent, soundName) => (dispatch, getState) => {
    // handle notifications in desktop app >= 4.3.0
    if (isDesktopApp() && window.desktop && semver.gte(window.desktop.version, '4.3.0')) {
        const msg = {
            title,
            body,
            channel,
            teamId,
            silent,
        };

        if (isDesktopApp() && window.desktop && semver.gte(window.desktop.version, '4.6.0')) {
            msg.data = {soundName};
        }

        // get the desktop app to trigger the notification
        window.postMessage(
            {
                type: 'dispatch-notification',
                message: msg,
            },
            window.location.origin,
        );
    } else {
        showNotification({
            title,
            body,
            requireInteraction: false,
            silent,
            onClick: () => {
                window.focus();
                browserHistory.push(Utils.getChannelURL(getState(), channel, teamId));
            },
        }).catch((error) => {
            dispatch(logError(error));
        });
    }
};
