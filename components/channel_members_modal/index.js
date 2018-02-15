// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {canManageChannelMembers} from 'mattermost-redux/selectors/entities/channels';

import ChannelMembersModal from './channel_members_modal.jsx';

const mapStateToProps = (state) => ({
    canManageChannelMembers: canManageChannelMembers(state)
});

export default connect(mapStateToProps)(ChannelMembersModal);
