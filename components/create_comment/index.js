// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';

import PostStore from 'stores/post_store.jsx';

import CreateComment from './create_comment.jsx';

function mapStateToProps(state, ownProps) {
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
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        createPostErrorId: err.server_error_id
    };
}

export default connect(mapStateToProps)(CreateComment);
