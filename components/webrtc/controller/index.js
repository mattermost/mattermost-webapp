// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {closeRightHandSide as closeRhs} from 'actions/views/rhs';

import WebrtcController from './webrtc_controller.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const enableDeveloper = config.EnableDeveloper === 'true';

    return {
        enableDeveloper,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRhs,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WebrtcController);
