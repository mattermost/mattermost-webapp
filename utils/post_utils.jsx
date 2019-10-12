// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import removeMd from 'remove-markdown';
import rangy from 'rangy';

import {createSelector} from 'reselect';
import {Client4} from 'mattermost-redux/client';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {makeGetReactionsForPost} from 'mattermost-redux/selectors/entities/posts';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {makeGetDisplayName, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {Permissions, Posts} from 'mattermost-redux/constants';
import * as PostListUtils from 'mattermost-redux/utils/post_list';
import {canEditPost as canEditPostRedux} from 'mattermost-redux/utils/post_utils';

import * as TextFormatting from 'utils/text_formatting.jsx';

import {getEmojiMap} from 'selectors/emojis';

import store from 'stores/redux_store.jsx';

import Constants, {PostListRowListIds, Preferences} from 'utils/constants.jsx';
import {formatWithRenderer} from 'utils/markdown';
import MentionableRenderer from 'utils/markdown/mentionable_renderer';
import * as Utils from 'utils/utils.jsx';
import {isMobile} from 'utils/user_agent.jsx';

import * as Emoticons from './emoticons.jsx';

const CHANNEL_SWITCH_IGNORE_ENTER_THRESHOLD_MS = 500;

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
    return getCurrentUserId(store.getState()) === post.user_id;
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
    if (!src) {
        return src;
    }

    const imageAPI = Client4.getBaseRoute() + '/image?url=';

    if (hasImageProxy && !src.startsWith(imageAPI)) {
        return imageAPI + encodeURIComponent(src);
    }

    return src;
}

export function canDeletePost(post) {
    if (post.type === Constants.PostTypes.FAKE_PARENT_DELETED) {
        return false;
    }
    const channel = getChannel(store.getState(), post.channel_id);

    if (channel && channel.delete_at !== 0) {
        return false;
    }

    if (isPostOwner(post)) {
        return haveIChannelPermission(store.getState(), {channel: post.channel_id, team: channel && channel.team_id, permission: Permissions.DELETE_POST});
    }
    return haveIChannelPermission(store.getState(), {channel: post.channel_id, team: channel && channel.team_id, permission: Permissions.DELETE_OTHERS_POSTS});
}

export function canEditPost(post) {
    const state = store.getState();
    const license = getLicense(state);
    const config = getConfig(state);
    const channel = getChannel(state, post.channel_id);
    const userId = getCurrentUserId(state);
    return canEditPostRedux(state, config, license, channel && channel.team_id, channel && channel.id, userId, post);
}

export function shouldShowDotMenu(post) {
    if (post && post.state === Posts.POST_DELETED) {
        return false;
    }

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

export function shouldFocusMainTextbox(e, activeElement) {
    if (!e) {
        return false;
    }

    // Do not focus if we're currently focused on a textarea or input
    const keepFocusTags = ['TEXTAREA', 'INPUT'];
    if (!activeElement || keepFocusTags.includes(activeElement.tagName)) {
        return false;
    }

    // Focus if it is an attempted paste
    if (Utils.cmdOrCtrlPressed(e) && Utils.isKeyPressed(e, Constants.KeyCodes.V)) {
        return true;
    }

    // Do not focus if a modifier key is pressed
    if (e.ctrlKey || e.metaKey || e.altKey) {
        return false;
    }

    // Do not focus if the key is undefined or null
    if (e.key == null) {
        return false;
    }

    // Do not focus for non-character or non-number keys
    if (e.key.length !== 1 || !e.key.match(/./)) {
        return false;
    }

    return true;
}

function canAutomaticallyCloseBackticks(message) {
    const splitMessage = message.split('\n').filter((line) => line.trim() !== '');
    const lastPart = splitMessage[splitMessage.length - 1];

    if (splitMessage.length > 1 && !lastPart.includes('```')) {
        return {
            allowSending: true,
            message: message.endsWith('\n') ? message.concat('```') : message.concat('\n```'),
            withClosedCodeBlock: true,
        };
    }

    return {allowSending: true};
}

function sendOnCtrlEnter(message, ctrlOrMetaKeyPressed, isSendMessageOnCtrlEnter) {
    const match = message.match(Constants.TRIPLE_BACK_TICKS);
    if (isSendMessageOnCtrlEnter && ctrlOrMetaKeyPressed && (!match || match.length % 2 === 0)) {
        return {allowSending: true};
    } else if (!isSendMessageOnCtrlEnter && (!match || match.length % 2 === 0)) {
        return {allowSending: true};
    } else if (ctrlOrMetaKeyPressed && match && match.length % 2 !== 0) {
        return canAutomaticallyCloseBackticks(message);
    }

    return {allowSending: false};
}

export function postMessageOnKeyPress(event, message, sendMessageOnCtrlEnter, sendCodeBlockOnCtrlEnter, now = 0, lastChannelSwitchAt = 0) {
    if (!event) {
        return {allowSending: false};
    }

    // Typing enter on mobile never sends.
    if (isMobile()) {
        return {allowSending: false};
    }

    // Only ENTER sends, unless shift or alt key pressed.
    if (!Utils.isKeyPressed(event, Constants.KeyCodes.ENTER) || event.shiftKey || event.altKey) {
        return {allowSending: false};
    }

    // Don't send if we just switched channels within a threshold.
    if (lastChannelSwitchAt > 0 && now > 0 && now - lastChannelSwitchAt <= CHANNEL_SWITCH_IGNORE_ENTER_THRESHOLD_MS) {
        return {allowSending: false, ignoreKeyPress: true};
    }

    if (
        message.trim() === '' ||
        !(sendMessageOnCtrlEnter || sendCodeBlockOnCtrlEnter)
    ) {
        return {allowSending: true};
    }

    const ctrlOrMetaKeyPressed = event.ctrlKey || event.metaKey;

    if (sendMessageOnCtrlEnter) {
        return sendOnCtrlEnter(message, ctrlOrMetaKeyPressed, true);
    } else if (sendCodeBlockOnCtrlEnter) {
        return sendOnCtrlEnter(message, ctrlOrMetaKeyPressed, false);
    }

    return {allowSending: false};
}

export function isErrorInvalidSlashCommand(error) {
    if (error && error.server_error_id) {
        return error.server_error_id === 'api.command.execute_command.not_found.app_error';
    }

    return false;
}

function isIdNotPost(postId) {
    return (
        PostListUtils.isStartOfNewMessages(postId) ||
        PostListUtils.isDateLine(postId) ||
        PostListRowListIds[postId]
    );
}

// getOldestPostId returns the oldest valid post ID in the given list of post IDs. This function is copied from
// mattermost-redux, except it also includes additional special IDs that are only used in the web app.
export function getOldestPostId(postIds) {
    for (let i = postIds.length - 1; i >= 0; i--) {
        const item = postIds[i];

        if (isIdNotPost(item)) {
            // This is not a post at all
            continue;
        }

        if (PostListUtils.isCombinedUserActivityPost(item)) {
            // This is a combined post, so find the first post ID from it
            const combinedIds = PostListUtils.getPostIdsForCombinedUserActivityPost(item);

            return combinedIds[combinedIds.length - 1];
        }

        // This is a post ID
        return item;
    }

    return '';
}

export function getPreviousPostId(postIds, startIndex) {
    for (var i = startIndex + 1; i < postIds.length; i++) {
        const itemId = postIds[i];

        if (isIdNotPost(itemId)) {
            // This is not a post at all
            continue;
        }

        if (PostListUtils.isCombinedUserActivityPost(itemId)) {
            // This is a combined post, so find the last post ID from it
            const combinedIds = PostListUtils.getPostIdsForCombinedUserActivityPost(itemId);

            return combinedIds[0];
        }

        // This is a post ID
        return itemId;
    }

    return '';
}

// getLatestPostId returns the most recent valid post ID in the given list of post IDs. This function is copied from
// mattermost-redux, except it also includes additional special IDs that are only used in the web app.
export function getLatestPostId(postIds) {
    for (let i = 0; i < postIds.length; i++) {
        const item = postIds[i];

        if (isIdNotPost(item)) {
            // This is not a post at all
            continue;
        }

        if (PostListUtils.isCombinedUserActivityPost(item)) {
            // This is a combined post, so find the lastest post ID from it
            const combinedIds = PostListUtils.getPostIdsForCombinedUserActivityPost(item);

            return combinedIds[0];
        }

        // This is a post ID
        return item;
    }

    return '';
}

export function makeCreateAriaLabelForPost() {
    const getReactionsForPost = makeGetReactionsForPost();
    const getDisplayName = makeGetDisplayName();

    return createSelector(
        (state, post) => post,
        (state, post) => getDisplayName(state, post.user_id),
        (state, post) => getReactionsForPost(state, post.id),
        (state, post) => get(state, Preferences.CATEGORY_FLAGGED_POST, post.id, null) != null,
        (post, author, reactions, isFlagged) => {
            return (intl) => createAriaLabelForPost(post, author, isFlagged, reactions, intl);
        }
    );
}

export function createAriaLabelForPost(post, author, isFlagged, reactions, intl) {
    const {formatMessage, formatTime, formatDate} = intl;

    const emojiMap = getEmojiMap(store.getState());
    let message = post.message;
    let match;

    // Match all the shorthand forms of emojis first
    for (const name of Object.keys(Emoticons.emoticonPatterns)) {
        const pattern = Emoticons.emoticonPatterns[name];
        message = message.replace(pattern, `:${name}:`);
    }

    while ((match = Emoticons.EMOJI_PATTERN.exec(message)) !== null) {
        if (emojiMap.has(match[2])) {
            message = message.replace(match[0], `${match[2].replace(/_/g, ' ')} emoji`);
        }
    }

    let ariaLabel;
    if (post.root_id) {
        ariaLabel = formatMessage({
            id: 'post.ariaLabel.replyMessage',
            defaultMessage: '{authorName} at {time} {date} wrote a reply, {message}',
        },
        {
            authorName: author,
            time: formatTime(post.create_at),
            date: formatDate(post.create_at, {weekday: 'long', month: 'long', day: 'numeric'}),
            message,
        });
    } else {
        ariaLabel = formatMessage({
            id: 'post.ariaLabel.message',
            defaultMessage: '{authorName} at {time} {date} wrote, {message}',
        },
        {
            authorName: author,
            time: formatTime(post.create_at),
            date: formatDate(post.create_at, {weekday: 'long', month: 'long', day: 'numeric'}),
            message,
        });
    }

    let attachmentCount = 0;
    if (post.props && post.props.attachments) {
        attachmentCount += post.props.attachments.length;
    }
    if (post.file_ids) {
        attachmentCount += post.file_ids.length;
    }

    if (attachmentCount) {
        if (attachmentCount > 1) {
            ariaLabel += formatMessage({
                id: 'post.ariaLabel.attachmentMultiple',
                defaultMessage: ', {attachmentCount} attachments',
            },
            {
                attachmentCount,
            });
        } else {
            ariaLabel += formatMessage({
                id: 'post.ariaLabel.attachment',
                defaultMessage: ', 1 attachment',
            });
        }
    }

    if (reactions) {
        const emojiNames = [];
        for (const reaction of Object.values(reactions)) {
            const emojiName = reaction.emoji_name;

            if (emojiNames.indexOf(emojiName) < 0) {
                emojiNames.push(emojiName);
            }
        }

        if (emojiNames.length > 1) {
            ariaLabel += formatMessage({
                id: 'post.ariaLabel.reactionMultiple',
                defaultMessage: ', {reactionCount} reactions',
            },
            {
                reactionCount: emojiNames.length,
            });
        } else {
            ariaLabel += formatMessage({
                id: 'post.ariaLabel.reaction',
                defaultMessage: ', 1 reaction',
            });
        }
    }

    if (isFlagged) {
        if (post.is_pinned) {
            ariaLabel += formatMessage({
                id: 'post.ariaLabel.messageIsFlaggedAndPinned',
                defaultMessage: ', message is flagged and pinned',
            });
        } else {
            ariaLabel += formatMessage({
                id: 'post.ariaLabel.messageIsFlagged',
                defaultMessage: ', message is flagged',
            });
        }
    } else if (!isFlagged && post.is_pinned) {
        ariaLabel += formatMessage({
            id: 'post.ariaLabel.messageIsPinned',
            defaultMessage: ', message is pinned',
        });
    }

    return ariaLabel;
}

// Splits text message based on the current caret position
export function splitMessageBasedOnCaretPosition(caretPosition, message) {
    const firstPiece = message.substring(0, caretPosition);
    const lastPiece = message.substring(caretPosition, message.length);
    return {firstPiece, lastPiece};
}

export async function copyPostData(e, getPostForCopy) {
    const selection = rangy.getSelection();
    if (selection.rangeCount) {
        const nodes = selection.getRangeAt(0).getNodes();
        const postIds = new Set(nodes.map((node) => getSelectedNodePostIds(node)).filter((node) => node !== null));
        const postData = Array.from(postIds).map((postId) => getPostForCopy(postId));
        const resolved = await Promise.all(postData);

        e.clipboardData.setData('text/markdown', resolved.map((post) => post.content).join('\n\r'));
        e.clipboardData.setData('text/html', getHtmlFormat(resolved));
        e.clipboardData.setData('text/plain', getRichTextFormat(resolved));
        e.preventDefault();
    }
}

function getSelectedNodePostIds(node) {
    let currNode = node;
    while (!(
        currNode.tagName &&
        currNode.tagName === 'DIV' &&
        currNode.id &&
        currNode.id === 'postContent')
    ) {
        currNode = currNode.parentNode;
        if (currNode === null) {
            break;
        }
    }

    if (currNode) {
        return currNode.parentNode.id.split('post_')[1];
    }

    return null;
}

function getHtmlFormat(copyData) {
    let content = '';
    for (const post of copyData) {
        const htmlContent = TextFormatting.formatText(post.content);
        content += `${htmlContent}<br/>`;
    }
    return content;
}

function getRichTextFormat(copyData) {
    const NEW_LINE = '\n\r';
    const DOUBLE_DIGIT_MONTH = 10;

    const dateMap = new Map();
    copyData.forEach((post) => {
        const month = post.date.getMonth();
        const paddedMonth = month >= DOUBLE_DIGIT_MONTH ? month : '0' + month;
        const date = `${paddedMonth}-${post.date.getDate()}-${post.date.getFullYear()}`;
        if (dateMap.has(date)) {
            const currList = dateMap.get(date);
            currList.push(post);
            dateMap.set(date, currList);
        } else {
            dateMap.set(date, [post]);
        }
    });

    let content = '';
    for (const [date, posts] of dateMap.entries()) {
        const dateString = getDateSeperatorFormat(new Date(date));
        content += `${dateString}${NEW_LINE}`;
        for (const post of posts) {
            content += `${post.user} - ${getDateTwelveHourFormat(post.date)}${NEW_LINE}`;
            content += `${removeMd(post.content)}${NEW_LINE}${NEW_LINE}`;
        }
    }
    return content;
}

function getDateSeperatorFormat(date) {
    const DAYS = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    const dayStr = DAYS[date.getDay()];
    const dayOfMonth = date.getDate();
    const monthStr = MONTHS[date.getMonth()];
    const yearStr = date.getFullYear();
    return `${dayStr}, ${monthStr} ${dayOfMonth}, ${yearStr}`;
}

function getDateTwelveHourFormat(date) {
    const AM_PM_THRESHOLD = 12;
    const DOUBLE_DIGIT_MINUTES = 10;

    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= AM_PM_THRESHOLD ? 'PM' : 'AM';
    hours %= AM_PM_THRESHOLD;
    hours = hours || AM_PM_THRESHOLD;
    minutes = minutes < DOUBLE_DIGIT_MINUTES ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}