// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {memo} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';

import {getPost, makeGetPostsForThread} from 'mattermost-redux/selectors/entities/posts';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';
import {getThread} from 'mattermost-redux/selectors/entities/threads';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {GlobalState} from 'types/store';

import ThreadItem, {OwnProps} from './thread_item';

function makeMapStateToProps() {
    const getPostsForThread = makeGetPostsForThread();
    const getChannel = makeGetChannel();
    const getDisplayName = makeGetDisplayName();

    return (state: GlobalState, ownProps: OwnProps) => {
        const {threadId} = ownProps;

        const post = getPost(state, threadId);

        return {
            channel: getChannel(state, {id: post.channel_id}),
            currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
            displayName: getDisplayName(state, post.user_id, true),
            post,
            postsInThread: getPostsForThread(state, {rootId: post.id}),
            thread: getThread(state, threadId),
        };
    };
}

export default compose(
    connect(makeMapStateToProps),
    memo,
)(ThreadItem) as React.FunctionComponent<OwnProps>;
