// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import WebrtcController from './webrtc_controller.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const enableDeveloper = config.EnableDeveloper === 'true';

    return {
        ...ownProps,
        enableDeveloper
    };
}

export default connect(mapStateToProps)(WebrtcController);
