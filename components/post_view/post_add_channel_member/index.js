// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {addChannelMember} from 'mattermost-redux/actions/channels';
import {removePost} from 'mattermost-redux/actions/posts';
import {getPost} from 'mattermost-redux/selectors/entities/posts'
import {getChannel, getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import PostAddChannelMember from './post_add_channel_member.jsx';

function mapStateToProps(state, ownProps) {
    const currentChannelId = getCurrentChannelId(state);

    return {
        ...ownProps,
        team: getCurrentTeam(state),
        channel: getChannel(state, currentChannelId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addChannelMember,
            getPost,
            removePost
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostAddChannelMember);
