// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {addChannelMember} from 'mattermost-redux/actions/channels';
import {removePost} from 'mattermost-redux/actions/posts';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getChannel, getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import PostAddChannelMember from './post_add_channel_member.jsx';

const mapStateToProps = (state) => {
    const currentChannelId = getCurrentChannelId(state);

    return {
        team: getCurrentTeam(state),
        channel: getChannel(state, currentChannelId),
        currentUser: getCurrentUser(state)
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        addChannelMember,
        getPost,
        removePost
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PostAddChannelMember);
