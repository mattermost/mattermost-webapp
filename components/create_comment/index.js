// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {createPost, addReaction, removeReaction} from 'mattermost-redux/actions/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import CreateComment from './create_comment.jsx';

function mapStateToProps(state) {
    const err = state.requests.posts.createPost.error || {};
    return {
        userId: getCurrentUserId(state),
        createPostErrorId: err.server_error_id
    };
}

const mapDispatchToProps = {
    createPost,
    addReaction,
    removeReaction
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateComment);
