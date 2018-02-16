// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import GetAndroidApp from './get_android_app.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const androidAppDownloadLink = config.AndroidAppDownloadLink;

    return {
        androidAppDownloadLink
    };
}

export default connect(mapStateToProps)(GetAndroidApp);
