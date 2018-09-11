// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {closeRightHandSide} from 'actions/views/rhs';

import WebrtcOption from './webrtc';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        closeRightHandSide,
    }, dispatch),
});

export default connect(null, mapDispatchToProps)(WebrtcOption);
