// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';

import GetAndroidApp from './get_android_app';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        androidAppDownloadLink: config.AndroidAppDownloadLink,
    };
}

export default connect(mapStateToProps)(GetAndroidApp);
