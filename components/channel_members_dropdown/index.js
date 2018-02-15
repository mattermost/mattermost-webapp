// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannelStats} from 'mattermost-redux/actions/channels';

import ChannelMembersDropdown from './channel_members_dropdown.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getChannelStats
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(ChannelMembersDropdown);
