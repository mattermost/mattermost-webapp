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

    const getPostsForThreadProps = {rootId: ''};
    const getChannelProps = {id: ''};

    return (state: GlobalState, ownProps: OwnProps) => {
        const {threadId} = ownProps;

        const post = getPost(state, threadId);

        if (getPostsForThreadProps.rootId !== post.id) {
            getPostsForThreadProps.rootId = post.id;
        }

        if (getChannelProps.id !== post.channel_id) {
            getChannelProps.id = post.channel_id;
        }

        return {
            channel: getChannel(state, getChannelProps),
            currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
            displayName: getDisplayName(state, post.user_id, true),
            post,
            postsInThread: getPostsForThread(state, getPostsForThreadProps),
            thread: getThread(state, threadId),
        };
    };
}

export default compose(
    connect(makeMapStateToProps),
    memo,
)(ThreadItem) as React.FunctionComponent<OwnProps>;
