// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Parser, ProcessNodeDefinitions} from 'html-to-react';
import {Client4} from 'mattermost-redux/client';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';

import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {Permissions} from 'mattermost-redux/constants';

import AtMention from 'components/at_mention';
import LatexBlock from 'components/latex_block';
import MarkdownImage from 'components/markdown_image';
import PostEmoji from 'components/post_emoji';

import UserStore from 'stores/user_store.jsx';
import store from 'stores/redux_store.jsx';

import Constants from 'utils/constants.jsx';
import {formatWithRenderer} from 'utils/markdown';
import MentionableRenderer from 'utils/markdown/mentionable_renderer';
import * as Utils from 'utils/utils.jsx';

export function isSystemMessage(post) {
    return Boolean(post.type && (post.type.lastIndexOf(Constants.SYSTEM_MESSAGE_PREFIX) === 0));
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

export function getProfilePicSrcForPost(post, user) {
    const config = getConfig(store.getState());

    let src = '';
    if (user && user.id === post.user_id) {
        src = Utils.imageURLForUser(user);
    } else {
        src = Utils.imageURLForUser(post.user_id);
    }

    if (post.props && post.props.from_webhook && !post.props.use_user_icon && config.EnablePostIconOverride === 'true') {
        if (post.props.override_icon_url) {
            src = post.props.override_icon_url;
        } else {
            src = Constants.DEFAULT_WEBHOOK_LOGO;
        }
    } else if (isSystemMessage(post)) {
        src = Constants.SYSTEM_MESSAGE_PROFILE_IMAGE;
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

/*
 * Converts HTML to React components using html-to-react.
 * The following options can be specified:
 * - mentions - If specified, mentions are replaced with the AtMention component. Defaults to true.
 * - emoji - If specified, emoji text is replaced with the PostEmoji component. Defaults to true.
 * - images - If specified, markdown images are replaced with the PostMarkdown component. Defaults to true.
 * - latex - If specified, latex is replaced with the LatexBlock component. Defaults to true.
 */
export function messageHtmlToComponent(html, isRHS, options = {}) {
    if (!html) {
        return null;
    }

    const parser = new Parser();
    const processNodeDefinitions = new ProcessNodeDefinitions(React);

    function isValidNode() {
        return true;
    }

    const processingInstructions = [];
    if (!('mentions' in options) || options.mentions) {
        const mentionAttrib = 'data-mention';
        processingInstructions.push({
            replaceChildren: true,
            shouldProcessNode: (node) => node.attribs && node.attribs[mentionAttrib],
            processNode: (node) => {
                const mentionName = node.attribs[mentionAttrib];
                const callAtMention = (
                    <AtMention
                        mentionName={mentionName}
                        isRHS={isRHS}
                        hasMention={true}
                    />
                );
                return callAtMention;
            },
        });
    }

    if (!('emoji' in options) || options.emoji) {
        const emojiAttrib = 'data-emoticon';
        processingInstructions.push({
            replaceChildren: true,
            shouldProcessNode: (node) => node.attribs && node.attribs[emojiAttrib],
            processNode: (node) => {
                const emojiName = node.attribs[emojiAttrib];
                const callPostEmoji = (
                    <PostEmoji
                        name={emojiName}
                    />
                );
                return callPostEmoji;
            },
        });
    }

    if (!('images' in options) || options.images) {
        processingInstructions.push({
            shouldProcessNode: (node) => node.type === 'tag' && node.name === 'img',
            processNode: (node) => {
                const {
                    class: className,
                    ...attribs
                } = node.attribs;
                const callMarkdownImage = (
                    <MarkdownImage
                        className={className}
                        {...attribs}
                    />
                );
                return callMarkdownImage;
            },
        });
    }

    if (!('latex' in options) || options.latex) {
        processingInstructions.push({
            shouldProcessNode: (node) => node.attribs && node.attribs['data-latex'],
            processNode: (node) => {
                return (
                    <LatexBlock content={node.attribs['data-latex']}/>
                );
            },
        });
    }

    processingInstructions.push({
        shouldProcessNode: () => true,
        processNode: processNodeDefinitions.processDefaultNode,
    });

    return parser.parseWithInstructions(html, isValidNode, processingInstructions);
}
