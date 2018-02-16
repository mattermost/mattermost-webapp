// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import WebrtcController from './webrtc_controller.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const enableDeveloper = config.EnableDeveloper === 'true';

    return {
        ...ownProps,
        enableDeveloper
    };
}

export default connect(mapStateToProps)(WebrtcController);
