// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import GetAndroidApp from './get_android_app.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const androidAppDownloadLink = config.AndroidAppDownloadLink;

    return {
        ...ownProps,
        androidAppDownloadLink
    };
}

export default connect(mapStateToProps)(GetAndroidApp);
