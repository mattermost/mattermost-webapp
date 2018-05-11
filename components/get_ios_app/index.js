// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import GetIosApp from './get_ios_app.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const iosAppDownloadLink = config.IosAppDownloadLink;

    return {
        iosAppDownloadLink,
    };
}

export default connect(mapStateToProps)(GetIosApp);
