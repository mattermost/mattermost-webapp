// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPost, makeGetPostsForThread} from 'mattermost-redux/selectors/entities/posts';
import {removePost} from 'mattermost-redux/actions/posts';

import RhsThread from './rhs_thread.jsx';

function makeMapStateToProps() {
    const getPostsForThread = makeGetPostsForThread();

    return function mapStateToProps(state, ownProps) {
        let selected = getPost(state, state.views.rhs.selectedPostId);

        // If there is no root post found, assume it has been deleted by data retention policy, and create a fake one.
        if (!selected) {
            selected = {
                id: state.views.rhs.selectedPostId,
                exists: false,
                type: 'system_deleted',
                message: 'Part of this thread has been deleted due to a data retention policy. You can no longer reply to this thread.',
                channel_id: state.views.rhs.selectedPostChannelId,
                user_id: state.entities.users.currentUserId
            };
        }

        let posts = [];
        if (selected) {
            posts = getPostsForThread(state, {rootId: selected.id, channelId: selected.channel_id});
        }

        if (posts.length > 0 && selected.type === 'system_deleted') {
            selected.create_at = posts[0].create_at;
        }

        return {
            ...ownProps,
            selected,
            posts
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            removePost
        }, dispatch)
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(RhsThread);
