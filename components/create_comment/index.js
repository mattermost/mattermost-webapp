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
import * as GlobalActions from 'actions/global_actions.jsx';
import * as ChannelActions from 'actions/channel_actions.jsx';

import {EmojiMap} from 'stores/emoji_store.jsx';
import PostStore from 'stores/post_store.jsx';

import * as Utils from 'utils/utils.jsx';

import {REACTION_PATTERN} from 'components/create_post.jsx';
import CreateComment from './create_comment.jsx';

const getCommentDraft = (rootId) => {
    const {
        message = '',
        fileInfos = [],
        uploadsInProgress = []
    } = PostStore.getCommentDraft(rootId) || {};

    const draft = {message, fileInfos, uploadsInProgress};

    return draft;
};

function mapStateToProps(state, ownProps) {
    const err = state.requests.posts.createPost.error || {};

    const draft = getCommentDraft(ownProps.rootId);

    const enableAddButton = draft.message.trim().length !== 0 || draft.fileInfos.length !== 0;

    return {
        draft,
        enableAddButton,
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        createPostErrorId: err.server_error_id
    };
};

const makeOnUpdateCommentDraft = (rootId) => (draft) => PostActions.updateCommentDraft(rootId, draft);

function makeOnMoveHistoryIndex(rootId, direction) {
    const getMessageInHistory = makeGetMessageInHistoryItem(Posts.MESSAGE_TYPES.COMMENT);

    return () => (dispatch, getState) => {
        const draft = getCommentDraft(rootId);

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

const submitPost = (channelId, rootId, draft) => (dispatch, getState) => {
    const state = getState();

    const userId = getCurrentUserId(state);

    const time = Utils.getTimestamp();

    const post = {
        file_ids: [],
        message: draft.message,
        channel_id: channelId,
        root_id: rootId,
        parent_id: rootId,
        pending_post_id: `${userId}:${time}`,
        user_id: userId,
        create_at: time
    };

    GlobalActions.emitUserCommentedEvent(post);

    PostActions.createPost(post, draft.fileInfos);
};

const submitReaction = (postId, action, emojiName) => (dispatch) => {
    if (action === '+') {
        dispatch(addReaction(postId, emojiName));
    } else if (action === '-') {
        dispatch(removeReaction(postId, emojiName));
    }
};

const submitCommand = (channelId, rootId, draft) => (dispatch, getState) => {
    const state = getState();

    const teamId = getCurrentTeamId(state);

    const args = {
        channel_id: channelId,
        team_id: teamId,
        root_id: rootId,
        parent_id: rootId
    };

    const {message} = draft;

    return new Promise((resolve, reject) => {
        ChannelActions.executeCommand(message, args, resolve, (err) => {
            if (err.sendMessage) {
                dispatch(submitPost(channelId, rootId, draft));
            } else {
                reject(err);
            }
        });
    });
};

function makeOnSubmit(channelId, rootId, latestPostId) {
    return () => async (dispatch, getState) => {
        const draft = getCommentDraft(rootId);
        const {message} = draft;

        dispatch(addMessageIntoHistory(message));

        dispatch(PostActions.updateCommentDraft(rootId, null));

        const isReaction = REACTION_PATTERN.exec(message);

        const state = getState();
        const emojis = getCustomEmojisByName(state);
        const emojiMap = new EmojiMap(emojis);

        if (isReaction && emojiMap.has(isReaction[2])) {
            dispatch(submitReaction(latestPostId, isReaction[1], isReaction[2]));
        } else if (message.indexOf('/') === 0) {
            await dispatch(submitCommand(channelId, rootId, draft));
        } else {
            dispatch(submitPost(channelId, rootId, draft));
        }
    };
}

function mapDispatchToProps(dispatch, ownProps) {
    return bindActionCreators({
        onUpdateCommentDraft: makeOnUpdateCommentDraft(ownProps.rootId),
        onSubmit: makeOnSubmit(ownProps.channelId, ownProps.rootId, ownProps.latestPostId),
        onResetHistoryIndex: () => resetHistoryIndex(Posts.MESSAGE_TYPES.COMMENT),
        onMoveHistoryIndexBack: makeOnMoveHistoryIndex(ownProps.rootId, -1),
        onMoveHistoryIndexForward: makeOnMoveHistoryIndex(ownProps.rootId, 1)
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateComment);
