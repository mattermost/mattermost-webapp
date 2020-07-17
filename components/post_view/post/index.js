// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Posts} from 'mattermost-redux/constants';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost, makeIsPostCommentMention} from 'mattermost-redux/selectors/entities/posts';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {isSystemMessage} from 'mattermost-redux/utils/post_utils';

import {markPostAsUnread} from 'actions/post_actions';
import {selectPost, selectPostCard} from 'actions/views/rhs';

import {isArchivedChannel} from 'utils/channel_utils';
import {Preferences} from 'utils/constants';
import {makeCreateAriaLabelForPost, makeGetReplyCount} from 'utils/post_utils.jsx';

import Post from './post.jsx';

// isFirstReply returns true when the given post a comment that isn't part of the same thread as the previous post.
export function isFirstReply(post, previousPost) {
    if (post.root_id) {
        if (previousPost) {
            // Returns true as long as the previous post is part of a different thread
            return post.root_id !== previousPost.id && post.root_id !== previousPost.root_id;
        }

        // The previous post is not a real post
        return true;
    }

    // This post is not a reply
    return false;
}

function makeMapStateToProps() {
    const getReplyCount = makeGetReplyCount();
    const isPostCommentMention = makeIsPostCommentMention();
    const createAriaLabelForPost = makeCreateAriaLabelForPost();

    return (state, ownProps) => {
        const post = ownProps.post || getPost(state, ownProps.postId);
        const channel = getChannel(state, post.channel_id);

        let previousPost = null;
        if (ownProps.previousPostId) {
            previousPost = getPost(state, ownProps.previousPostId);
        }

        let consecutivePostByUser = false;
        let previousPostIsComment = false;

        if (previousPost) {
            consecutivePostByUser = post.user_id === previousPost.user_id && // The post is by the same user
                post.create_at - previousPost.create_at <= Posts.POST_COLLAPSE_TIMEOUT && // And was within a short time period
                !(post.props && post.props.from_webhook) && !(previousPost.props && previousPost.props.from_webhook) && // And neither is from a webhook
                !isSystemMessage(post) && !isSystemMessage(previousPost); // And neither is a system message

            previousPostIsComment = Boolean(previousPost.root_id);
        }

        return {
            post,
            createAriaLabel: createAriaLabelForPost(state, post),
            currentUserId: getCurrentUserId(state),
            isFirstReply: isFirstReply(post, previousPost),
            consecutivePostByUser,
            previousPostIsComment,
            replyCount: getReplyCount(state, post),
            isCommentMention: isPostCommentMention(state, post.id),
            center: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_CENTERED,
            compactDisplay: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
            channelIsArchived: isArchivedChannel(channel),
            isFlagged: get(state, Preferences.CATEGORY_FLAGGED_POST, post.id, null) != null,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            selectPost,
            selectPostCard,
            markPostAsUnread,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Post);
