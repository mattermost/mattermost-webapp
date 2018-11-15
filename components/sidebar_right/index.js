// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {getPinnedPosts, setRhsExpanded, showPinnedPosts} from 'actions/views/rhs';
import {
    getIsRhsExpanded,
    getIsRhsOpen,
    getRhsState,
    getSelectedPostId,
    getSelectedChannelId,
    getPreviousRhsState,
} from 'selectors/rhs';
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
            const {focusedPostId} = state.views.channel;
            const post = getPost(state, focusedPostId);

            // the post take some time before being available on page load
            if (post != null) {
                channel = getChannel(state, post.channel_id);
            }
        }
    }

    return {
        isExpanded: getIsRhsExpanded(state),
        isOpen: getIsRhsOpen(state),
        channel,
        currentUser: getCurrentUser(state),
        postRightVisible: Boolean(getSelectedPostId(state)),
        searchVisible: Boolean(rhsState),
        previousRhsState: getPreviousRhsState(state),
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
        isPinnedPosts: rhsState === RHSStates.PIN,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getPinnedPosts,
            setRhsExpanded,
            showPinnedPosts,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarRight);
