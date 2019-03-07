// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {
    getPostIdsInChannel,
    makeGetPostIdsAroundPost,
} from 'mattermost-redux/selectors/entities/posts';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';

import {
    checkAndSetMobileView,
    increasePostVisibility,
    loadInitialPosts,
} from 'actions/views/channel';
import {Preferences} from 'utils/constants.jsx';

import PostList from './post_list.jsx';

function makeMapStateToProps() {
    const getPostIdsAroundPost = makeGetPostIdsAroundPost();

    const preparePostIdsForPostList = makePreparePostIdsForPostList();

    return function mapStateToProps(state, ownProps) {
        const postVisibility = state.views.channel.postVisibility[ownProps.channelId];
        const lastViewedAt = state.views.channel.lastChannelViewTime[ownProps.channelId];

        let postIds;
        if (ownProps.focusedPostId) {
            postIds = getPostIdsAroundPost(state, ownProps.focusedPostId, ownProps.channelId);
        } else {
            postIds = getPostIdsInChannel(state, ownProps.channelId);
        }

        if (postIds) {
            postIds = preparePostIdsForPostList(state, {postIds, lastViewedAt, indicateNewMessages: true});
        }

        return {
            channel: getChannel(state, ownProps.channelId) || {},
            lastViewedAt,
            postIds,
            postVisibility,
            loadingPosts: state.views.channel.loadingPosts[ownProps.channelId],
            focusedPostId: ownProps.focusedPostId,
            fullWidth: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadInitialPosts,
            increasePostVisibility,
            checkAndSetMobileView,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostList);
