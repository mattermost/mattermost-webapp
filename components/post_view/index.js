// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {
    getPostIdsInChannel,
    makeGetPostIdsAroundPost,
} from 'mattermost-redux/selectors/entities/posts';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';

import {
    checkAndSetMobileView,
    increasePostVisibility,
    loadInitialPosts,
} from 'actions/views/channel';
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

        const channel = getChannel(state, ownProps.channelId);
        const team = getTeamByName(state, ownProps.match.params.team);
        let teammate;
        if (channel && channel.type === Constants.DM_CHANNEL && channel.teammate_id) {
            teammate = getUser(state, channel.teammate_id);
        }

        const channelLoading = isChannelLoading(ownProps.match.params, channel, team, teammate);

        return {
            channel,
            postVisibility,
            postListIds: postIds,
            channelLoading,
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

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(PostList));
