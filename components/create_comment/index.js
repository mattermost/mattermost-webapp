// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {resetHistoryIndex} from 'mattermost-redux/actions/posts';
import {Preferences, Posts} from 'mattermost-redux/constants';

import {
    updateCommentDraft,
    makeOnMoveHistoryIndex,
    submitPost,
    submitReaction,
    submitCommand,
    makeOnSubmit,
    makeOnEditLatestPost
} from 'actions/views/rhs';

import PostStore from 'stores/post_store.jsx';

import CreateComment from './create_comment.jsx';

function mapStateToProps(state, ownProps) {
    const err = state.requests.posts.createPost.error || {};

    const draft = PostStore.getCommentDraft(ownProps.rootId);

    const enableAddButton = draft.message.trim().length !== 0 || draft.fileInfos.length !== 0;

    return {
        draft,
        enableAddButton,
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        createPostErrorId: err.server_error_id
    };
}

const makeOnUpdateCommentDraft = (rootId) => (draft) => updateCommentDraft(rootId, draft);

function mapDispatchToProps(dispatch, ownProps) {
    return bindActionCreators({
        onUpdateCommentDraft: makeOnUpdateCommentDraft(ownProps.rootId),
        onSubmit: makeOnSubmit(ownProps.channelId, ownProps.rootId, ownProps.latestPostId),
        onResetHistoryIndex: () => resetHistoryIndex(Posts.MESSAGE_TYPES.COMMENT),
        onMoveHistoryIndexBack: makeOnMoveHistoryIndex(ownProps.rootId, -1),
        onMoveHistoryIndexForward: makeOnMoveHistoryIndex(ownProps.rootId, 1),
        onEditLatestPost: makeOnEditLatestPost(ownProps.channelId, ownProps.rootId)
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateComment);
