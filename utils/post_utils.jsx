// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {Parser, ProcessNodeDefinitions} from 'html-to-react';

import ChannelStore from 'stores/channel_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import AtMention from 'components/at_mention';
import MarkdownImage from 'components/markdown_image';

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

export function getProfilePicSrcForPost(post, user) {
    let src = '';
    if (user && user.id === post.user_id) {
        src = Utils.imageURLForUser(user);
    } else {
        src = Utils.imageURLForUser(post.user_id);
    }

    if (post.props && post.props.from_webhook && !post.props.use_user_icon && global.window.mm_config.EnablePostIconOverride === 'true') {
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

    const isOwner = isPostOwner(post);
    const isSystemAdmin = UserStore.isSystemAdminForCurrentUser();
    const isTeamAdmin = TeamStore.isTeamAdminForCurrentTeam() || isSystemAdmin;
    const isChannelAdmin = ChannelStore.isChannelAdminForCurrentChannel() || isTeamAdmin;
    const isAdmin = isChannelAdmin || isTeamAdmin || isSystemAdmin;

    if (global.window.mm_license.IsLicensed === 'true') {
        return (global.window.mm_config.RestrictPostDelete === Constants.PERMISSIONS_DELETE_POST_ALL && (isOwner || isChannelAdmin)) ||
            (global.window.mm_config.RestrictPostDelete === Constants.PERMISSIONS_DELETE_POST_TEAM_ADMIN && isTeamAdmin) ||
            (global.window.mm_config.RestrictPostDelete === Constants.PERMISSIONS_DELETE_POST_SYSTEM_ADMIN && isSystemAdmin);
    }

    return isOwner || isAdmin;
}

export function canEditPost(post, editDisableAction) {
    const isOwner = isPostOwner(post);
    let canEdit = isOwner && !isSystemMessage(post);

    if (canEdit && global.window.mm_license.IsLicensed === 'true') {
        if (global.window.mm_config.AllowEditPost === Constants.ALLOW_EDIT_POST_NEVER) {
            canEdit = false;
        } else if (global.window.mm_config.AllowEditPost === Constants.ALLOW_EDIT_POST_TIME_LIMIT) {
            const timeLeft = (post.create_at + (global.window.mm_config.PostEditTimeLimit * 1000)) - Utils.getTimestamp();
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

export function containsAtMention(text, key) {
    if (!text || !key) {
        return false;
    }

    // This doesn't work for at mentions containing periods or hyphens
    return new RegExp(`\\B${key}\\b`, 'i').test(removeCode(text));
}

// Returns a given text string with all Markdown code replaced with whitespace.
export function removeCode(text) {
    // These patterns should match the ones in app/notification.go, except JavaScript doesn't
    // support \z for the end of the text in multiline mode, so we use $(?![\r\n])
    const codeBlockPattern = /^[^\S\n]*[`~]{3}.*$[\s\S]+?(^[^\S\n]*[`~]{3}$|$(?![\r\n]))/m;
    const inlineCodePattern = /`+(?:.+?|.*?\n(.*?\S.*?\n)*.*?)`+/m;

    return text.replace(codeBlockPattern, '').replace(inlineCodePattern, ' ');
}

export function postMessageHtmlToComponent(html, isRHS = false, hasMention = false) {
    const parser = new Parser();
    const attrib = 'data-mention';
    const processNodeDefinitions = new ProcessNodeDefinitions(React);

    function isValidNode() {
        return true;
    }

    const processingInstructions = [
        {
            replaceChildren: true,
            shouldProcessNode: (node) => node.attribs && node.attribs[attrib],
            processNode: (node) => {
                const mentionName = node.attribs[attrib];
                const callAtMention = (
                    <AtMention
                        mentionName={mentionName}
                        isRHS={isRHS}
                        hasMention={hasMention}
                    />
                );
                return callAtMention;
            }
        },
        {
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
            }
        },
        {
            shouldProcessNode: () => true,
            processNode: processNodeDefinitions.processDefaultNode
        }
    ];
    return parser.parseWithInstructions(html, isValidNode, processingInstructions);
}