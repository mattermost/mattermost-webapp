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

const makeMapStateToProps = () => {
    const getPostsInChannel = makeGetPostsInChannel();
    const getPostsAroundPost = makeGetPostsAroundPost();

    return (state, ownProps) => {
        let posts;
        if (ownProps.focusedPostId) {
            posts = getPostsAroundPost(state, ownProps.focusedPostId, ownProps.channelId);
        } else {
            posts = getPostsInChannel(state, ownProps.channelId);
        }

        return {
            channel: getChannel(state, ownProps.channelId) || {},
            lastViewedAt: state.views.channel.lastChannelViewTime[ownProps.channelId],
            posts,
            postVisibility: state.views.channel.postVisibility[ownProps.channelId],
            loadingPosts: state.views.channel.loadingPosts[ownProps.channelId],
            focusedPostId: ownProps.focusedPostId,
            currentUserId: getCurrentUserId(state),
            fullWidth: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN
        };
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getPosts,
        getPostsBefore,
        getPostsAfter,
        getPostThread,
        increasePostVisibility,
        checkAndSetMobileView
    }, dispatch)
});

export default connect(makeMapStateToProps, mapDispatchToProps)(PostList);
