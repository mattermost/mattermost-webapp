// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {addChannelMember} from 'mattermost-redux/actions/channels';
import {removePost} from 'mattermost-redux/actions/posts';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getChannel, getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import PostAddChannelMember from './post_add_channel_member.jsx';

function mapStateToProps(state, ownProps) {
    const currentChannelId = getCurrentChannelId(state);
    const channel = getChannel(state, currentChannelId);
    let channelType = '';
    if (channel && channel.type) {
        channelType = channel.type;
    }

    return {
        ...ownProps,
        channelType,
        currentUser: getCurrentUser(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addChannelMember,
            getPost,
            removePost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostAddChannelMember);
