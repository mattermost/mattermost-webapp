// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import GetIosApp from './get_ios_app.jsx';

function mapStateToProps(state) {
    const config = state.entities.general.config;
    const iosAppDownloadLink = config.IosAppDownloadLink;

    return {
        iosAppDownloadLink
    };
}

export default connect(mapStateToProps)(GetIosApp);
