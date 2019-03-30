// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {getPosts, getPostsAfter, getPostsBefore, getPostThread} from 'mattermost-redux/actions/posts';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetPostsAroundPost, makeGetPostsInChannel} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';

import {increasePostVisibility} from 'actions/post_actions.jsx';
import {checkAndSetMobileView} from 'actions/views/channel';
import {makePreparePostIdsForPostList} from 'selectors/posts';
import {Constants} from 'utils/constants.jsx';

import PostList from './post_list.jsx';

// This function is added as a fail safe for the channel sync issue we have.
// When the user switches to a team for the first time we show the channel of previous team and then settle for the right channel after that
// This causes the scroll correction etc an issue because post_list is not mounted for new channel instead it is updated
const isChannelLoading = (params, channel, team, teammate) => {
    if (params.postid) {
        return false;
    }

    if (channel && team) {
        if (channel.type !== Constants.DM_CHANNEL && channel.name !== params.identifier) {
            return true;
        } else if (channel.type === Constants.DM_CHANNEL && teammate && params.identifier !== `@${teammate.username}`) {
            return true;
        }

        if (channel.team_id && channel.team_id !== team.id) {
            return true;
        }

        return false;
    }

    return true;
};

function makeMapStateToProps() {
    const getPostsInChannel = makeGetPostsInChannel();
    const getPostsAroundPost = makeGetPostsAroundPost();
    const preparePostIdsForPostList = makePreparePostIdsForPostList();

    return function mapStateToProps(state, ownProps) {
        const postVisibility = state.views.channel.postVisibility[ownProps.channelId];

        let posts;
        if (ownProps.focusedPostId) {
            posts = getPostsAroundPost(state, ownProps.focusedPostId, ownProps.channelId);
        } else {
            posts = getPostsInChannel(state, ownProps.channelId, postVisibility);
        }

        const channel = getChannel(state, ownProps.channelId);
        const team = getTeamByName(state, ownProps.match.params.team);
        let teammate;
        if (channel && channel.type === Constants.DM_CHANNEL && channel.teammate_id) {
            teammate = getUser(state, channel.teammate_id);
        }

        const channelLoading = isChannelLoading(ownProps.match.params, channel, team, teammate);
        const lastViewedAt = state.views.channel.lastChannelViewTime[ownProps.channelId];
        const {postIds, postsObjById} = preparePostIdsForPostList(state, {posts, lastViewedAt, indicateNewMessages: true});

        return {
            channel,
            lastViewedAt,
            posts,
            postsObjById,
            postVisibility,
            postListIds: postIds,
            loadingPosts: state.views.channel.loadingPosts[ownProps.channelId],
            focusedPostId: ownProps.focusedPostId,
            currentUserId: getCurrentUserId(state),
            channelLoading,
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

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(PostList));
