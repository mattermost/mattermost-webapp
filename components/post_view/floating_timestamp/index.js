// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import * as PostListUtils from 'mattermost-redux/utils/post_list';

import {getToastStatus} from 'selectors/views/channel';

import FloatingTimestamp from './floating_timestamp';

function mapStateToProps(state, ownProps) {
    let postId = ownProps.postId;
    if (PostListUtils.isCombinedUserActivityPost(postId)) {
        const combinedIds = PostListUtils.getPostIdsForCombinedUserActivityPost(postId);

        postId = combinedIds[combinedIds.length - 1];
    }

    const post = getPost(state, postId);

    const toastPresent = getToastStatus(state);
    return {
        createAt: post ? post.create_at : 0,
        toastPresent,
    };
}

export default connect(mapStateToProps)(FloatingTimestamp);
