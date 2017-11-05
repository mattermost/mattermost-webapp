// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {Preferences} from 'mattermost-redux/constants';
import {EmojiMap} from 'stores/emoji_store.jsx';

import PostStore from 'stores/post_store.jsx';

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

        const draft = {message, fileInfos, uploadsInProgress};

        const enableAddButton = message.trim().length !== 0 || fileInfos.length !== 0;

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

export default connect(makeMapStateToProps)(CreateComment);
