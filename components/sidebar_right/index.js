// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import PostStore from 'stores/post_store';
import {getPinnedPosts, getFlaggedPosts} from 'actions/views/rhs';
import {getRhsState, getSelectedPostId, getSelectedChannelId, getPreviousRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants.jsx';

import SidebarRight from './sidebar_right.jsx';

const mapStateToProps = (state) => {
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
        previousRhsState: getPreviousRhsState(state),
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
        isPinnedPosts: rhsState === RHSStates.PIN
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getPinnedPosts,
        getFlaggedPosts
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SidebarRight);
