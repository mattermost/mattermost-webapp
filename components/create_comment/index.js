// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {resetHistoryIndex} from 'mattermost-redux/actions/posts';
import {Preferences, Posts} from 'mattermost-redux/constants';

import {
    clearCommentDraftUploads,
    updateCommentDraft,
    makeOnMoveHistoryIndex,
    makeOnSubmit,
    makeOnEditLatestPost
} from 'actions/views/create_comment';

import {makeGetCommentDraft} from 'selectors/rhs';

import CreateComment from './create_comment.jsx';

function mapStateToProps(state, ownProps) {
    const err = state.requests.posts.createPost.error || {};

    const getCommentDraft = makeGetCommentDraft(ownProps.rootId);

    const draft = getCommentDraft(state);

    const enableAddButton = draft.message.trim().length !== 0 || draft.fileInfos.length !== 0;

    return {
        draft,
        enableAddButton,
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        createPostErrorId: err.server_error_id
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
            onEditLatestPost
        }, dispatch);
    };
}

export default connect(mapStateToProps, makeMapDispatchToProps)(CreateComment);
