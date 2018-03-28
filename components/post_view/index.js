// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPosts, getPostsAfter, getPostsBefore, getPostThread} from 'mattermost-redux/actions/posts';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetPostsAroundPost, makeGetPostsInChannel} from 'mattermost-redux/selectors/entities/posts';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {increasePostVisibility} from 'actions/post_actions.jsx';
import {checkAndSetMobileView} from 'actions/views/channel';
import {Preferences} from 'utils/constants.jsx';

import PostList from './post_list.jsx';

function makeMapStateToProps() {
    const getPostsInChannel = makeGetPostsInChannel();
    const getPostsAroundPost = makeGetPostsAroundPost();

    return function mapStateToProps(state, ownProps) {
        const postVisibility = state.views.channel.postVisibility[ownProps.channelId];

        let posts;
        if (ownProps.focusedPostId) {
            posts = getPostsAroundPost(state, ownProps.focusedPostId, ownProps.channelId);
        } else {
            posts = getPostsInChannel(state, ownProps.channelId, postVisibility);
        }

        return {
            channel: getChannel(state, ownProps.channelId) || {},
            lastViewedAt: state.views.channel.lastChannelViewTime[ownProps.channelId],
            posts,
            postVisibility,
            loadingPosts: state.views.channel.loadingPosts[ownProps.channelId],
            focusedPostId: ownProps.focusedPostId,
            currentUserId: getCurrentUserId(state),
            fullWidth: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getPosts,
            getPostsBefore,
            getPostsAfter,
            getPostThread,
            increasePostVisibility,
            checkAndSetMobileView,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostList);
