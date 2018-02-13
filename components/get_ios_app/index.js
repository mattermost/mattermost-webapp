// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import GetIosApp from './get_ios_app.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const iosAppDownloadLink = config.IosAppDownloadLink;

    return {
        ...ownProps,
        iosAppDownloadLink
    };
}

export default connect(mapStateToProps)(GetIosApp);
