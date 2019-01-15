// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {leaveChannel} from 'actions/views/channel';

import LeaveChannel from './leave_channel';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({leaveChannel}, dispatch),
});

export default connect(null, mapDispatchToProps)(LeaveChannel);
