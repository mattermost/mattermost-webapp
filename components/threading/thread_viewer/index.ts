// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {makeGetPostsForThread, getPost, makeGetPostIdsForThread} from 'mattermost-redux/selectors/entities/posts';
import {getThread} from 'mattermost-redux/selectors/entities/threads';
import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {removePost, getPostThread} from 'mattermost-redux/actions/posts';
import {getThread as fetchThread, updateThreadRead} from 'mattermost-redux/actions/threads';

import {GenericAction} from 'mattermost-redux/types/actions';
import {Post} from 'mattermost-redux/types/posts';
import {UserThread} from 'mattermost-redux/types/threads';
import {Channel} from 'mattermost-redux/types/channels';

import {getSocketStatus} from 'selectors/views/websocket';
import {selectPostCard} from 'actions/views/rhs';
import {updateThreadLastOpened} from 'actions/views/threads';
import {GlobalState} from 'types/store';

import ThreadViewer from './thread_viewer';

type OwnProps = {
    rootPostId: string;
};

function makeMapStateToProps() {
    const getPostsForThread = makeGetPostsForThread();
    const getPostIdsForThread = makeGetPostIdsForThread();
    const getChannel = makeGetChannel();

    return function mapStateToProps(state: GlobalState, {rootPostId}: OwnProps) {
        const currentUserId = getCurrentUserId(state);
        const currentTeamId = getCurrentTeamId(state);
        const selected = getPost(state, rootPostId);
        const socketStatus = getSocketStatus(state);

        let posts: Post[] = [];
        let postIds: string[] = [];
        let userThread: UserThread | null = null;
        let channel: Channel | null = null;

        if (selected) {
            posts = getPostsForThread(state, {rootId: selected.id});
            postIds = getPostIdsForThread(state, selected.id);
            userThread = getThread(state, selected.id);
            channel = getChannel(state, {id: selected.channel_id});
        }

        return {
            isCollapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
            currentUserId,
            currentTeamId,
            userThread,
            selected,
            posts,
            postIds,
            socketConnectionStatus: socketStatus.connected,
            channel,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            removePost,
            getPostThread,
            selectPostCard,
            getThread: fetchThread,
            updateThreadRead,
            updateThreadLastOpened,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ThreadViewer);
