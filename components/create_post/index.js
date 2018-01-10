// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel, getCurrentChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {get, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {makeGetMessageInHistoryItem, getPost, getMostRecentPostIdInChannel, makeGetCommentCountForPost, getLatestReplyablePostId, getCurrentUsersLatestPost} from 'mattermost-redux/selectors/entities/posts';
import {addMessageIntoHistory, moveHistoryIndexBack, moveHistoryIndexForward, createPost, createPostImmediately, addReaction, removeReaction} from 'mattermost-redux/actions/posts';
import {Posts} from 'mattermost-redux/constants';

import {setEditingPost} from 'actions/post_actions.jsx';
import {selectPostFromRightHandSideSearchByPostId} from 'actions/views/rhs';
import {makeGetGlobalItem} from 'selectors/storage';
import {setGlobalItem, actionOnGlobalItemsWithPrefix} from 'actions/storage';
import {Preferences, StoragePrefixes} from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent';

import CreatePost from './create_post.jsx';

function mapStateToProps() {
    return (state, ownProps) => {
        const currentChannel = getCurrentChannel(state) || {};
        const getDraft = makeGetGlobalItem(StoragePrefixes.DRAFT + currentChannel.id, {
            message: '',
            uploadsInProgress: [],
            fileInfos: []
        });
        const recentPostIdInChannel = getMostRecentPostIdInChannel(state, currentChannel.id);
        const post = getPost(state, recentPostIdInChannel);
        const getCommentCountForPost = makeGetCommentCountForPost();
        const latestReplyablePostId = getLatestReplyablePostId(state);
        const currentChannelMembersCount = getCurrentChannelStats(state) ? getCurrentChannelStats(state).member_count : 1;
        return {
            ...ownProps,
            currentTeamId: getCurrentTeamId(state),
            currentChannel,
            currentChannelMembersCount,
            currentUserId: getCurrentUserId(state),
            ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
            fullWidthTextBox: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
            showTutorialTip: get(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), 999),
            messageInHistoryItem: makeGetMessageInHistoryItem(Posts.MESSAGE_TYPES.POST)(state),
            draft: getDraft(state),
            recentPostIdInChannel,
            commentCountForPost: getCommentCountForPost(state, {post}),
            latestReplyablePostId,
            currentUsersLatestPost: getCurrentUsersLatestPost(state)
        };
    };
}

function mapDispatchToProps(dispatch) {
    var createPostTemp = createPost;
    if (UserAgent.isIosClassic()) {
        createPostTemp = createPostImmediately;
    }

    return {
        actions: bindActionCreators({
            addMessageIntoHistory,
            moveHistoryIndexBack,
            moveHistoryIndexForward,
            createPost: createPostTemp,
            addReaction,
            removeReaction,
            setDraft: setGlobalItem,
            clearDraftUploads: actionOnGlobalItemsWithPrefix,
            selectPostFromRightHandSideSearchByPostId,
            setEditingPost
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePost);
