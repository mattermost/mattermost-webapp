// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {deleteAndRemovePost} from 'actions/post_actions.jsx';

import DeletePostModal from './delete_post_modal.jsx';

function mapStateToProps(state, ownProps) {
    const channel = getChannel(state, ownProps.post.channel_id);
    let channelName = '';
    if (channel) {
        channelName = channel.name;
    }

    const {focusedPostId} = state.views.channel;

    return {
        channelName,
        focusedPostId,
        teamName: getCurrentTeam(state).name,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deleteAndRemovePost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeletePostModal);
