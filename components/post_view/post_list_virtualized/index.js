// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {
    getPostIdsInChannel,
    makeGetPostIdsAroundPost,
} from 'mattermost-redux/selectors/entities/posts';
import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';

import PostList from './post_list_virtualized.jsx';

function makeMapStateToProps() {
    const getPostIdsAroundPost = makeGetPostIdsAroundPost();
    const preparePostIdsForPostList = makePreparePostIdsForPostList();

    return function mapStateToProps(state, ownProps) {
        let postIds;

        if (ownProps.focusedPostId) {
            postIds = getPostIdsAroundPost(state, ownProps.focusedPostId, ownProps.channelId);
        } else {
            postIds = getPostIdsInChannel(state, ownProps.channelId);
        }

        if (postIds) {
            postIds = preparePostIdsForPostList(state, {postIds, lastViewedAt: ownProps.lastViewedAt, indicateNewMessages: true});
        }

        return {
            postListIds: postIds,
        };
    };
}

export default connect(makeMapStateToProps)(PostList);
