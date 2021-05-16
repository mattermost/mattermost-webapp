// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost, makeGetCommentCountForPost} from 'mattermost-redux/selectors/entities/posts';

import {GlobalState} from 'types/store';

import CommentIcon from 'components/common/comment_icon';

type OwnProps = {
    postId: string;
}

function makeMapStateToProps() {
    const getReplyCount = makeGetCommentCountForPost();

    return (state: GlobalState, ownProps: OwnProps) => {
        const post = getPost(state, ownProps.postId);

        return {
            commentCount: getReplyCount(state, post),
        };
    };
}

export default connect(makeMapStateToProps)(CommentIcon);
