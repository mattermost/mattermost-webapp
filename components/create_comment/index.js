// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getAllChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {makeGetMessageInHistoryItem} from 'mattermost-redux/selectors/entities/posts';
import {resetCreatePostRequest, resetHistoryIndex} from 'mattermost-redux/actions/posts';
import {Preferences, Posts} from 'mattermost-redux/constants';

import {Constants, StoragePrefixes} from 'utils/constants.jsx';

import {
    clearCommentDraftUploads,
    updateCommentDraft,
    makeOnMoveHistoryIndex,
    makeOnSubmit,
    makeOnEditLatestPost,
} from 'actions/views/create_comment';
import {getPostDraft} from 'selectors/rhs';

import CreateComment from './create_comment.jsx';

function mapStateToProps(state, ownProps) {
    const err = state.requests.posts.createPost.error || {};

    const draft = getPostDraft(state, StoragePrefixes.COMMENT_DRAFT, ownProps.rootId);
    const enableAddButton = draft.message.trim().length !== 0 || draft.fileInfos.length !== 0;

    const channelMembersCount = getAllChannelStats(state)[ownProps.channelId] ? getAllChannelStats(state)[ownProps.channelId].member_count : 1;
    const messageInHistory = makeGetMessageInHistoryItem(Posts.MESSAGE_TYPES.COMMENT)(state);

    const channel = state.entities.channels.channels[ownProps.channelId] || {};

    const config = getConfig(state);
    const enableConfirmNotificationsToChannel = config.EnableConfirmNotificationsToChannel === 'true';
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';

    return {
        draft,
        messageInHistory,
        enableAddButton,
        channelMembersCount,
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        createPostErrorId: err.server_error_id,
        readOnlyChannel: !isCurrentUserSystemAdmin(state) && config.ExperimentalTownSquareIsReadOnly === 'true' && channel.name === Constants.DEFAULT_CHANNEL,
        enableConfirmNotificationsToChannel,
        enableEmojiPicker,
        maxPostSize: parseInt(config.MaxPostSize, 10) || Constants.DEFAULT_CHARACTER_LIMIT,
    };
}

function makeOnUpdateCommentDraft(rootId) {
    return (draft) => updateCommentDraft(rootId, draft);
}

function makeMapDispatchToProps() {
    let onUpdateCommentDraft;
    let onSubmit;
    let onMoveHistoryIndexBack;
    let onMoveHistoryIndexForward;
    let onEditLatestPost;

    function onResetHistoryIndex() {
        return resetHistoryIndex(Posts.MESSAGE_TYPES.COMMENT);
    }

    let rootId;
    let channelId;
    let latestPostId;

    return (dispatch, ownProps) => {
        if (rootId !== ownProps.rootId) {
            onUpdateCommentDraft = makeOnUpdateCommentDraft(ownProps.rootId);
            onMoveHistoryIndexBack = makeOnMoveHistoryIndex(ownProps.rootId, -1);
            onMoveHistoryIndexForward = makeOnMoveHistoryIndex(ownProps.rootId, 1);
        }

        if (rootId !== ownProps.rootId || channelId !== ownProps.channelId) {
            onEditLatestPost = makeOnEditLatestPost(ownProps.channelId, ownProps.rootId);
        }

        if (rootId !== ownProps.rootId || channelId !== ownProps.channelId || latestPostId !== ownProps.latestPostId) {
            onSubmit = makeOnSubmit(ownProps.channelId, ownProps.rootId, ownProps.latestPostId);
        }

        rootId = ownProps.rootId;
        channelId = ownProps.channelId;
        latestPostId = ownProps.latestPostId;

        return bindActionCreators({
            clearCommentDraftUploads,
            onUpdateCommentDraft,
            onSubmit,
            onResetHistoryIndex,
            onMoveHistoryIndexBack,
            onMoveHistoryIndexForward,
            onEditLatestPost,
            resetCreatePostRequest,
        }, dispatch);
    };
}

export default connect(mapStateToProps, makeMapDispatchToProps)(CreateComment);
