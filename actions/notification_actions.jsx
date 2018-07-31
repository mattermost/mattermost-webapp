// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {isSystemMessage} from 'mattermost-redux/utils/post_utils';

import ChannelStore from 'stores/channel_store.jsx';
import NotificationStore from 'stores/notification_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants, {NotificationLevels, UserStatuses} from 'utils/constants.jsx';
import {isMacApp, isMobileApp, isWindowsApp} from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import store from 'stores/redux_store.jsx';

import {formatWithRenderer} from 'utils/markdown';
import RemoveMarkdown from 'utils/markdown/remove_markdown';

const removeMarkdown = new RemoveMarkdown();
const NOTIFY_TEXT_MAX_LENGTH = 50;

export function sendDesktopNotification(post, msgProps) {
    if ((UserStore.getCurrentId() === post.user_id && post.props.from_webhook !== 'true')) {
        return;
    }

    if (isSystemMessage(post)) {
        return;
    }

    let mentions = [];
    if (msgProps.mentions) {
        mentions = JSON.parse(msgProps.mentions);
    }
    const teamId = msgProps.team_id;

    let channel = ChannelStore.get(post.channel_id);
    const user = UserStore.getCurrentUser();
    const userStatus = UserStore.getStatus(user.id);
    const member = ChannelStore.getMyMember(post.channel_id);

    if (isChannelMuted(member) || userStatus === UserStatuses.DND || userStatus === UserStatuses.OUT_OF_OFFICE) {
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

    const config = getConfig(store.getState());
    let username = Utils.localizeMessage('channel_loader.someone', 'Someone');
    if (post.props.override_username && config.EnablePostUsernameOverride === 'true') {
        username = post.props.override_username;
    } else if (msgProps.sender_name) {
        username = msgProps.sender_name;
    } else if (UserStore.hasProfile(post.user_id)) {
        username = UserStore.getProfile(post.user_id).username;
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

    let strippedMarkdownNotifyText = formatWithRenderer(notifyText, removeMarkdown);
    if (strippedMarkdownNotifyText.length > NOTIFY_TEXT_MAX_LENGTH) {
        strippedMarkdownNotifyText = strippedMarkdownNotifyText.substring(0, NOTIFY_TEXT_MAX_LENGTH - 1) + '...';
    }

    let body = '';
    if (strippedMarkdownNotifyText.length === 0) {
        if (msgProps.image) {
            body = username + Utils.localizeMessage('channel_loader.uploadedImage', ' uploaded an image');
        } else if (msgProps.otherFile) {
            body = username + Utils.localizeMessage('channel_loader.uploadedFile', ' uploaded a file');
        } else if (image) {
            body = username + Utils.localizeMessage('channel_loader.postedImage', ' posted an image');
        } else {
            body = username + Utils.localizeMessage('channel_loader.something', ' did something new');
        }
    } else {
        body = username + Utils.localizeMessage('channel_loader.wrote', ' wrote: ') + strippedMarkdownNotifyText;
    }

    //Play a sound if explicitly set in settings
    const sound = !user.notify_props || user.notify_props.desktop_sound === 'true';

    // Notify if you're not looking in the right channel or when
    // the window itself is not active
    const activeChannel = ChannelStore.getCurrent();
    const channelId = channel ? channel.id : null;
    const notify = (activeChannel && activeChannel.id !== channelId) || !NotificationStore.getFocus();

    if (notify) {
        Utils.notifyMe(title, body, channel, teamId, !sound);

        //Don't add extra sounds on native desktop clients
        if (sound && !isWindowsApp() && !isMacApp() && !isMobileApp()) {
            Utils.ding();
        }
    }
}
