// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux'
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {makeGetMessageInHistoryItem} from 'mattermost-redux/selectors/entities/posts'
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {
    addReaction,
    removeReaction,
    addMessageIntoHistory,
    resetHistoryIndex,
    moveHistoryIndexBack,
    moveHistoryIndexForward
} from 'mattermost-redux/actions/posts';
import {Preferences, Posts} from 'mattermost-redux/constants';

import * as PostActions from 'actions/post_actions.jsx';

import {EmojiMap} from 'stores/emoji_store.jsx';
import PostStore from 'stores/post_store.jsx';

import * as Utils from 'utils/utils.jsx';

import CreateComment from './create_comment.jsx';

function makeMapStateToProps() {
    let emojiMap;
    let oldCustomEmoji;

    return function mapStateToProps(state, ownProps) {
        const newCustomEmoji = getCustomEmojisByName(state);
        if (newCustomEmoji !== oldCustomEmoji) {
            emojiMap = new EmojiMap(newCustomEmoji);
        }
        oldCustomEmoji = newCustomEmoji;

        const err = state.requests.posts.createPost.error || {};

        const {
            message = '',
            fileInfos = [],
            uploadsInProgress = []
        } = PostStore.getCommentDraft(ownProps.rootId) || {};

        const enableAddButton = message.trim().length !== 0 || fileInfos.length !== 0;

        const draft = {message, fileInfos, uploadsInProgress};

        return {
            userId: getCurrentUserId(state),
            teamId: getCurrentTeamId(state),
            draft,
            enableAddButton,
            emojis: emojiMap,
            ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
            createPostErrorId: err.server_error_id
        };
    };
}

const makeOnUpdateCommentDraft = (rootId) => (message) => PostActions.updateCommentDraft(rootId, message);

function makeOnMoveHistoryIndex(rootId, direction) {
    const getMessageInHistory = makeGetMessageInHistoryItem(Posts.MESSAGE_TYPES.COMMENT);

    return () => (dispatch, getState) => {
        const draft = PostStore.getCommentDraft(rootId) || {};

        if (draft.message !== '' && draft.message !== getMessageInHistory(getState())) {
            return;
        }

        if (direction === -1) {
            dispatch(moveHistoryIndexBack(Posts.MESSAGE_TYPES.COMMENT));
        } else if (direction === 1) {
            dispatch(moveHistoryIndexForward(Posts.MESSAGE_TYPES.COMMENT));
        }

        const nextMessageInHistory = getMessageInHistory(getState());

        dispatch(PostActions.updateCommentDraft(rootId, {...draft, message: nextMessageInHistory}));
    };
}

function makeOnSubmitPost() {
    return (...args) => () => PostActions.createPost(...args);
}

function mapDispatchToProps(dispatch, ownProps) {
    return bindActionCreators({
        onUpdateCommentDraft: makeOnUpdateCommentDraft(ownProps.rootId),
        onSubmitPost: makeOnSubmitPost(),
        onAddReaction: addReaction,
        onRemoveReaction: removeReaction,
        onResetHistoryIndex: () => resetHistoryIndex(Posts.MESSAGE_TYPES.COMMENT),
        onMoveHistoryIndexBack: makeOnMoveHistoryIndex(ownProps.rootId, -1),
        onMoveHistoryIndexForward: makeOnMoveHistoryIndex(ownProps.rootId, 1),
        onAddMessageIntoHistory: addMessageIntoHistory
    }, dispatch);
}

export default connect(makeMapStateToProps, mapDispatchToProps)(CreateComment);
