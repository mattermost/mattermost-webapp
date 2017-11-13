// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import PostStore from 'stores/post_store';

import {showMentions, showPinnedPosts, showFlaggedPosts, closeRightHandSide} from 'actions/views/rhs';

import {getRhsState, getSelectedPostId, getSelectedChannelId} from 'selectors/rhs';

import {RHSStates} from 'utils/constants.jsx';

import SidebarRight from './sidebar_right.jsx';

function mapStateToProps(state) {
    const rhsState = getRhsState(state);

    const channelId = getSelectedChannelId(state);

    let channel = null;
    if (channelId) {
        channel = getChannel(state, channelId);
        if (channel == null) {
            // the permalink view is not really tied to a particular channel but still needs it
            const postId = PostStore.getFocusedPostId();
            const post = getPost(state, postId);

            // the post take some time before being available on page load
            if (post != null) {
                channel = getChannel(state, post.channel_id);
            }
        }
    }

    return {
        channel,
        currentUser: getCurrentUser(state),
        postRightVisible: Boolean(getSelectedPostId(state)),
        searchVisible: Boolean(rhsState),
        fromMentions: state.views.rhs.fromMentions,
        fromSearch: state.views.rhs.fromSearch,
        fromFlaggedPosts: state.views.rhs.fromFlaggedPosts,
        fromPinnedPosts: state.views.rhs.fromPinnedPosts,
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
        isPinnedPosts: rhsState === RHSStates.PIN
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            showMentions,
            showPinnedPosts,
            showFlaggedPosts,
            closeRightHandSide
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarRight);
