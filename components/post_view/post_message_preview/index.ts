// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getUser} from 'mattermost-redux/selectors/entities/users';
import {PostPreviewMetadata} from 'mattermost-redux/types/posts';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import PostMessagePreview from './post_message_preview';

type Props = {
    metadata: PostPreviewMetadata;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    let user = null;
    let post = null;
    if (ownProps.metadata.id) {
        post = getPost(state, ownProps.metadata.id);
    }
    if (post && post.user_id) {
        user = getUser(state, post.user_id);
    }

    return {
        post,
        user,
    };
}

export default connect(mapStateToProps, null)(PostMessagePreview);
