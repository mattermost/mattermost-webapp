// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {closeRightHandSide as closeRhs} from 'actions/views/rhs';
import {getIsRhsOpen} from 'selectors/rhs';

import WebrtcNotification from './webrtc_notification';

function mapStateToProps(state) {
    return {
        isRhsOpen: getIsRhsOpen(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRhs,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WebrtcNotification);
