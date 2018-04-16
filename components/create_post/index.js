// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel, getCurrentChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {get, getInt, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {
    getCurrentUsersLatestPost,
    getLatestReplyablePostId,
    getMostRecentPostIdInChannel,
    getPost,
    makeGetCommentCountForPost,
    makeGetMessageInHistoryItem,
} from 'mattermost-redux/selectors/entities/posts';
import {
    addMessageIntoHistory,
    moveHistoryIndexBack,
    moveHistoryIndexForward,
    addReaction,
    removeReaction,
} from 'mattermost-redux/actions/posts';
import {Posts} from 'mattermost-redux/constants';

import {emitUserPostedEvent, postListScrollChangeToBottom} from 'actions/global_actions.jsx';
import {createPost, setEditingPost} from 'actions/post_actions.jsx';
import {selectPostFromRightHandSideSearchByPostId} from 'actions/views/rhs';
import {getPostDraft} from 'selectors/rhs';
import {setGlobalItem, actionOnGlobalItemsWithPrefix} from 'actions/storage';
import {Constants, Preferences, StoragePrefixes, TutorialSteps} from 'utils/constants.jsx';
import {canUploadFiles} from 'utils/file_utils';

import CreatePost from './create_post.jsx';

function mapStateToProps() {
    return (state) => {
        const config = getConfig(state);
        const currentChannel = getCurrentChannel(state) || {};
        const draft = getPostDraft(state, StoragePrefixes.DRAFT, currentChannel.id);
        const recentPostIdInChannel = getMostRecentPostIdInChannel(state, currentChannel.id);
        const post = getPost(state, recentPostIdInChannel);
        const getCommentCountForPost = makeGetCommentCountForPost();
        const latestReplyablePostId = getLatestReplyablePostId(state);
        const currentChannelMembersCount = getCurrentChannelStats(state) ? getCurrentChannelStats(state).member_count : 1;
        const enableTutorial = config.EnableTutorial === 'true';
        const tutorialStep = getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED);
        const enableEmojiPicker = config.EnableEmojiPicker === 'true';
        const enableConfirmNotificationsToChannel = config.EnableConfirmNotificationsToChannel === 'true';

        return {
            currentTeamId: getCurrentTeamId(state),
            currentChannel,
            currentChannelMembersCount,
            currentUserId: getCurrentUserId(state),
            ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
            fullWidthTextBox: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
            showTutorialTip: enableTutorial && tutorialStep === TutorialSteps.POST_POPOVER,
            messageInHistoryItem: makeGetMessageInHistoryItem(Posts.MESSAGE_TYPES.POST)(state),
            draft,
            recentPostIdInChannel,
            commentCountForPost: getCommentCountForPost(state, {post}),
            latestReplyablePostId,
            currentUsersLatestPost: getCurrentUsersLatestPost(state),
            readOnlyChannel: !isCurrentUserSystemAdmin(state) && config.ExperimentalTownSquareIsReadOnly === 'true' && currentChannel.name === Constants.DEFAULT_CHANNEL,
            canUploadFiles: canUploadFiles(config),
            enableEmojiPicker,
            enableConfirmNotificationsToChannel,
            maxPostSize: parseInt(config.MaxPostSize, 10) || Constants.DEFAULT_CHARACTER_LIMIT,
        };
    };
}

function onSubmitPost(post, fileInfos) {
    return () => {
        emitUserPostedEvent(post);
        createPost(post, fileInfos);
        postListScrollChangeToBottom();
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
            setEditingPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePost);
