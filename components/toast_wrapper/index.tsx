// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {withRouter, RouteComponentProps} from 'react-router-dom';

import {IDMappedObjects} from '@mattermost/types/utilities';

import {Post} from 'packages/types/src/posts';

import {GlobalState as ToastWrapperState} from '@mattermost/types/store';

import {ViewsState} from 'types/store/views';

import {createSelector} from 'reselect';

import {Posts} from 'mattermost-redux/constants';

import {getAllPosts, getPostIdsInChannel} from 'mattermost-redux/selectors/entities/posts';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';

import {Channel} from '@mattermost/types/channels';

import {getCurrentChannel, countCurrentChannelUnreadMessages, isManuallyUnread} from 'mattermost-redux/selectors/entities/channels';

import {getUnreadScrollPositionPreference, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {updateToastStatus} from 'actions/views/channel';

import ToastWrapper from './toast_wrapper';

type GlobalState = ToastWrapperState & {
    views: ViewsState;
}

type OwnProps = RouteComponentProps & {
    channelId: string;
    atLatestPost?: boolean;
}

export function makeGetRootPosts() {
    return createSelector(
        'makeGetRootPosts',
        getAllPosts,
        getCurrentUserId,
        getCurrentChannel,
        (allPosts: IDMappedObjects<Post>, currentUserId: string, channel: Channel) => {
            // Count the number of new posts that haven't been deleted and are root posts
            return Object.values(allPosts).filter((post: Post) => {
                return (post.root_id === '' &&
                post.channel_id === channel.id &&
                post.state !== Posts.POST_DELETED);
            }).reduce((map, obj) => {
                (map as any)[obj.id] = true;
                return map;
            }, {});
        },
    );
}

export function makeCountUnreadsBelow() {
    return createSelector(
        'makeCountUnreadsBelow',
        getAllPosts,
        getCurrentUserId,
        isCollapsedThreadsEnabled,
        (state: GlobalState, postIds: string[] | null | undefined) => postIds,
        (state: GlobalState, postIds: string[] | null | undefined, lastViewedBottom: number) => lastViewedBottom,
        (allPosts: IDMappedObjects<Post>, currentUserId: string, isCollapsed: boolean, postIds, lastViewedBottom) => {
            if (!postIds) {
                return 0;
            }

            // Count the number of new posts made by other users that haven't been deleted
            return postIds.map((id: string) => allPosts[id]).filter((post: Post) => {
                return post &&
                    post.user_id !== currentUserId &&
                    post.state !== Posts.POST_DELETED &&
                    post.create_at > lastViewedBottom &&
                    (isCollapsed ? post.root_id === '' : true); // in collapsed threads mode, only count root posts
            }).length;
        },
    );
}

/* This connected component is written mainly for maintaining the unread count to be passed to the toast
   Unread count logic:
   * If channel is at the latest set of posts:
      Unread count is the Number of posts below new message line
   * if channel is not at the latest set of posts:
      1. UnreadCount + any recent messages in the latest chunk.
      2. If channel was marked as unread.
        * Unread count of channel alone.
*/

function makeMapStateToProps() {
    const countUnreadsBelow = makeCountUnreadsBelow();
    const getRootPosts = makeGetRootPosts();
    const preparePostIdsForPostList = makePreparePostIdsForPostList();
    return function mapStateToProps(state: GlobalState, {channelId, atLatestPost}: OwnProps) {
        let newRecentMessagesCount = 0;
        const channelMarkedAsUnread = isManuallyUnread(state, channelId);
        const lastViewedAt = state.views.channel.lastChannelViewTime[channelId];
        const unreadScrollPosition = getUnreadScrollPositionPreference(state);
        if (!atLatestPost) {
            let postIds = getPostIdsInChannel(state, channelId);
            if (postIds) {
                postIds = preparePostIdsForPostList(state, {postIds, lastViewedAt});
            }
            newRecentMessagesCount = countUnreadsBelow(state, postIds, lastViewedAt);
        }
        return {
            rootPosts: getRootPosts(state),
            lastViewedAt,
            newRecentMessagesCount,
            unreadScrollPosition,
            isCollapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
            unreadCountInChannel: countCurrentChannelUnreadMessages(state),
            channelMarkedAsUnread,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            updateToastStatus,
        }, dispatch),
    };
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(ToastWrapper));

