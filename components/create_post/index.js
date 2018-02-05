// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel, getCurrentChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {get, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {
    getCurrentUsersLatestPost,
    getLatestReplyablePostId,
    getMostRecentPostIdInChannel,
    getPost,
    makeGetCommentCountForPost,
    makeGetMessageInHistoryItem
} from 'mattermost-redux/selectors/entities/posts';
import {
    addMessageIntoHistory,
    moveHistoryIndexBack,
    moveHistoryIndexForward,
    addReaction,
    removeReaction
} from 'mattermost-redux/actions/posts';
import {Posts} from 'mattermost-redux/constants';

import {emitUserPostedEvent, postListScrollChange} from 'actions/global_actions.jsx';
import {createPost, setEditingPost} from 'actions/post_actions.jsx';
import {selectPostFromRightHandSideSearchByPostId} from 'actions/views/rhs';
import {makeGetGlobalItem} from 'selectors/storage';
import {setGlobalItem, actionOnGlobalItemsWithPrefix} from 'actions/storage';
import {Preferences, StoragePrefixes, TutorialSteps} from 'utils/constants.jsx';

import CreatePost from './create_post.jsx';

function mapStateToProps() {
    return (state, ownProps) => {
        const config = getConfig(state);
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
        const enableTutorial = config.EnableTutorial === 'true';
        const tutorialStep = parseInt(get(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED), 10);
        return {
            ...ownProps,
            currentTeamId: getCurrentTeamId(state),
            currentChannel,
            currentChannelMembersCount,
            currentUserId: getCurrentUserId(state),
            ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
            fullWidthTextBox: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
            showTutorialTip: enableTutorial && tutorialStep === TutorialSteps.POST_POPOVER,
            messageInHistoryItem: makeGetMessageInHistoryItem(Posts.MESSAGE_TYPES.POST)(state),
            draft: getDraft(state),
            recentPostIdInChannel,
            commentCountForPost: getCommentCountForPost(state, {post}),
            latestReplyablePostId,
            currentUsersLatestPost: getCurrentUsersLatestPost(state)
        };
    };
}

function onSubmitPost(post, fileInfos) {
    return () => {
        emitUserPostedEvent(post);
        createPost(post, fileInfos);
        postListScrollChange(true);
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addMessageIntoHistory,
            onSubmitPost,
            moveHistoryIndexBack,
            moveHistoryIndexForward,
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
