// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {leaveChannel} from 'mattermost-redux/actions/channels';

import LeavePrivateChannelModal from './leave_private_channel_modal.jsx';

function mapStateToProps() {
    return {
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            leaveChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LeavePrivateChannelModal);
