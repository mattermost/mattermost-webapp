// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost, makeIsPostCommentMention, makeGetCommentCountForPost} from 'mattermost-redux/selectors/entities/posts';
import {get, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {GenericAction} from 'mattermost-redux/types/actions';
import {Post} from 'mattermost-redux/types/posts';

import {markPostAsUnread} from 'actions/post_actions';
import {selectPost, selectPostCard} from 'actions/views/rhs';

import {GlobalState} from 'types/store';

import {isArchivedChannel} from 'utils/channel_utils';
import {Preferences} from 'utils/constants';
import {areConsecutivePostsBySameUser} from 'utils/post_utils';
import {getEditingPost} from '../../../selectors/posts';

import PostComponent from './post';

interface OwnProps {
    post?: Post;
    postId: string;
    previousPostId?: string;
}

// isFirstReply returns true when the given post a comment that isn't part of the same thread as the previous post.
export function isFirstReply(post: Post, previousPost: Post): boolean {
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
    const getReplyCount = makeGetCommentCountForPost();
    const isPostCommentMention = makeIsPostCommentMention();

    return (state: GlobalState, ownProps: OwnProps) => {
        const post = ownProps.post || getPost(state, ownProps.postId);
        const channel = getChannel(state, post.channel_id);
        const editingPost = getEditingPost(state);

        let previousPost = null;
        if (ownProps.previousPostId) {
            previousPost = getPost(state, ownProps.previousPostId);
        }

        let consecutivePostByUser = false;
        let previousPostIsComment = false;

        if (previousPost) {
            consecutivePostByUser = areConsecutivePostsBySameUser(post, previousPost);
            previousPostIsComment = Boolean(previousPost.root_id);
        }

        return {
            post,
            isBeingEdited: editingPost.postId === post.id,
            currentUserId: getCurrentUserId(state),
            isFirstReply: previousPost ? isFirstReply(post, previousPost) : false,
            consecutivePostByUser,
            previousPostIsComment,
            hasReplies: getReplyCount(state, post) > 0,
            isCommentMention: isPostCommentMention(state, post.id),
            center: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_CENTERED,
            compactDisplay: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
            channelIsArchived: isArchivedChannel(channel),
            isFlagged: get(state, Preferences.CATEGORY_FLAGGED_POST, post.id, null) != null,
            isCollapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            selectPost,
            selectPostCard,
            markPostAsUnread,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostComponent);
