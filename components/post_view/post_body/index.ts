// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost, isPostPriorityEnabled} from 'mattermost-redux/selectors/entities/posts';
import {isProfessionalOrEnterprise} from 'mattermost-redux/selectors/entities/general';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import {Post} from '@mattermost/types/posts';

import PostBody from './post_body';

interface OwnProps {
    post: Post;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    let parentPost;
    let parentPostUser;
    if (ownProps.post.root_id) {
        parentPost = getPost(state, ownProps.post.root_id);
        parentPostUser = parentPost ? getUser(state, parentPost.user_id) : null;
    }

    return {
        parentPost,
        parentPostUser,
        pluginPostTypes: state.plugins.postTypes,
        isPostPriorityEnabled: isPostPriorityEnabled(state) && isProfessionalOrEnterprise(state),
    };
}

export default connect(mapStateToProps)(PostBody);
