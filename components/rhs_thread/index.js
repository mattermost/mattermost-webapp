// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {makeGetPostsForThread} from 'mattermost-redux/selectors/entities/posts';
import {removePost} from 'mattermost-redux/actions/posts';

import {getSelectedPost} from 'selectors/rhs.jsx';
import RhsThread from './rhs_thread.jsx';
import {PostTypes} from 'utils/constants.jsx';

function makeMapStateToProps() {
    const getPostsForThread = makeGetPostsForThread();

    return function mapStateToProps(state, ownProps) {
        const selected = getSelectedPost(state);

        let posts = [];
        if (selected) {
            posts = getPostsForThread(state, {rootId: selected.id, channelId: selected.channel_id});
        }
/*
        if (posts.length > 0 && selected.type === PostTypes.FAKE_PARENT_DELETED) {
            selected.create_at = posts[0].create_at;
        }
*/
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
