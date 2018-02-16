// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import Setup from './setup.jsx';

function mapStateToProps(state) {
    const config = state.entities.general.config;

    const siteName = config.SiteName;
    const enforceMultifactorAuthentication = config.EnforceMultifactorAuthentication === 'true';

    return {
        siteName,
        enforceMultifactorAuthentication
    };
}

export default connect(mapStateToProps)(Setup);
