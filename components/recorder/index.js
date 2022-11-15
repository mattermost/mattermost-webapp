// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';

import {connect} from 'react-redux';

import {isRecordingModalVisible} from 'mattermost-redux/selectors/entities/voice';

import {stopRecording, sendRecording} from 'mattermost-redux/actions/voice';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {getSelectedPostId} from 'selectors/rhs';

import Recorder from './recorder';

function mapStateToProps(state) {
    return {
        visible: isRecordingModalVisible(state),
        channelId: getCurrentChannelId(state),
        rootId: getSelectedPostId(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            cancel: stopRecording,
            send: sendRecording,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Recorder);
