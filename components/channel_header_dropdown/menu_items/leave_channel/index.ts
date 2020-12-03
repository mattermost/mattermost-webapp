// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {leaveChannel} from 'actions/views/channel';

import LeaveChannel from './leave_channel';

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>) => ({
    actions: bindActionCreators({leaveChannel}, dispatch),
});

export default connect(null, mapDispatchToProps)(LeaveChannel);
