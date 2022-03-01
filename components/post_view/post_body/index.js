// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {getIsPostBeingEdited, getIsPostBeingEditedInRHS} from '../../../selectors/posts';

import PostBody from './post_body.jsx';

function mapStateToProps(state, ownProps) {
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
        isPostBeingEdited: getIsPostBeingEdited(state, ownProps.post.id),
        isPostBeingEditedInRHS: getIsPostBeingEditedInRHS(state, ownProps.post.id),
    };
}

export default connect(mapStateToProps)(PostBody);
