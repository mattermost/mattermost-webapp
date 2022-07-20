// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

// @ts-expect-error TS(2307): Cannot find module 'reselect' or its corresponding... Remove this comment to see the full error message
import {createSelector} from 'reselect';

// @ts-expect-error TS(2307): Cannot find module 'mattermost-redux/constants' or... Remove this comment to see the full error message
import {Posts} from 'mattermost-redux/constants';

// @ts-expect-error TS(2307): Cannot find module 'mattermost-redux/selectors/ent... Remove this comment to see the full error message
import {getAllPosts, getPostIdsInChannel} from 'mattermost-redux/selectors/entities/posts';

// @ts-expect-error TS(2307): Cannot find module 'mattermost-redux/selectors/ent... Remove this comment to see the full error message
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

// @ts-expect-error TS(2307): Cannot find module 'mattermost-redux/utils/post_li... Remove this comment to see the full error message
import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';

// @ts-expect-error TS(2307): Cannot find module 'mattermost-redux/selectors/ent... Remove this comment to see the full error message
import {getCurrentChannel, countCurrentChannelUnreadMessages, isManuallyUnread} from 'mattermost-redux/selectors/entities/channels';

// @ts-expect-error TS(2307): Cannot find module 'mattermost-redux/selectors/ent... Remove this comment to see the full error message
import {getUnreadScrollPositionPreference, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

// @ts-expect-error TS(2307): Cannot find module 'actions/views/channel' or its ... Remove this comment to see the full error message
import {updateToastStatus} from 'actions/views/channel';

// @ts-expect-error TS(6142): Module './toast_wrapper.jsx' was resolved to '/Use... Remove this comment to see the full error message
import ToastWrapper from './toast_wrapper.jsx';
export function makeGetRootPosts() {
    return createSelector(
        'makeGetRootPosts',
        getAllPosts,
        getCurrentUserId,
        getCurrentChannel,
        (allPosts: $TSFixMe, currentUserId: $TSFixMe, channel: $TSFixMe) => {
            // Count the number of new posts that haven't been deleted and are root posts
            // @ts-expect-error TS(2550): Property 'values' does not exist on type 'ObjectCo... Remove this comment to see the full error message
            return Object.values(allPosts).filter((post: $TSFixMe) => {
                return (
                    post.root_id === '' &&
                    post.channel_id === channel.id &&
                    post.state !== Posts.POST_DELETED
                );
            }).reduce((map: $TSFixMe, obj: $TSFixMe) => {
                map[obj.id] = true;
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
        (state: $TSFixMe, postIds: $TSFixMe) => postIds,
        (state: $TSFixMe, postIds: $TSFixMe, lastViewedBottom: $TSFixMe) => lastViewedBottom,
        isCollapsedThreadsEnabled,
        (allPosts: $TSFixMe, currentUserId: $TSFixMe, postIds: $TSFixMe, lastViewedBottom: $TSFixMe, isCollapsed: $TSFixMe) => {
            if (!postIds) {
                return 0;
            }

            // Count the number of new posts made by other users that haven't been deleted
            return postIds.map((id: $TSFixMe) => allPosts[id]).filter((post: $TSFixMe) => {
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
    return function mapStateToProps(state: $TSFixMe, ownProps: $TSFixMe) {
        let newRecentMessagesCount = 0;
        const channelMarkedAsUnread = isManuallyUnread(state, ownProps.channelId);
        const lastViewedAt = state.views.channel.lastChannelViewTime[ownProps.channelId];
        const unreadScrollPosition = getUnreadScrollPositionPreference(state);
        if (!ownProps.atLatestPost) {
            let postIds = getPostIdsInChannel(state, ownProps.channelId);
            if (postIds) {
                postIds = preparePostIdsForPostList(state, {postIds, lastViewedAt, channelId: ownProps.channelId});
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

function mapDispatchToProps(dispatch: $TSFixMe) {
    return {
        actions: bindActionCreators({
            updateToastStatus,
        }, dispatch),
    };
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(ToastWrapper));
