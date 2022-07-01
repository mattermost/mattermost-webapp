// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {memo} from 'react';
import {bindActionCreators, compose, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {getPost, makeGetPostsForThread} from 'mattermost-redux/selectors/entities/posts';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';
import {getThread} from 'mattermost-redux/selectors/entities/threads';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {GlobalState} from 'types/store';

import {GenericAction} from 'mattermost-redux/types/actions';
import {getPostThread} from 'mattermost-redux/actions/posts';

import ThreadItem, {OwnProps} from './thread_item';

function makeMapStateToProps() {
    const getPostsForThread = makeGetPostsForThread();
    const getChannel = makeGetChannel();
    const getDisplayName = makeGetDisplayName();

    return (state: GlobalState, ownProps: OwnProps) => {
        const {threadId} = ownProps;

        const post = getPost(state, threadId);

        return {
            post,
            channel: getChannel(state, {id: post.channel_id}),
            currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
            displayName: getDisplayName(state, post.user_id, true),
            postsInThread: getPostsForThread(state, post.id),
            thread: getThread(state, threadId),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getPostThread,
        }, dispatch),
    };
}

export default compose(
    connect(makeMapStateToProps, mapDispatchToProps),
    memo,
)(ThreadItem) as React.FunctionComponent<OwnProps>;
