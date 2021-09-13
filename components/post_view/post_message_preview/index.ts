// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getUser} from 'mattermost-redux/selectors/entities/users';
import {Post, PostPreviewMetadata} from 'mattermost-redux/types/posts';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import PostMessagePreview from './post_message_preview';

type Props = {
    metadata: PostPreviewMetadata;
    previewPost?: Post;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    let user = null;
    let previewPost = ownProps.previewPost;
    if (ownProps.metadata.post_id && !previewPost) {
        previewPost = getPost(state, ownProps.metadata.post_id);
    }
    if (previewPost && previewPost.user_id) {
        user = getUser(state, previewPost.user_id);
    }

    return {
        previewPost,
        user,
    };
}

export default connect(mapStateToProps, null)(PostMessagePreview);
