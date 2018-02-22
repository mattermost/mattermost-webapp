// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import Setup from './setup.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const siteName = config.SiteName;
    const enforceMultifactorAuthentication = config.EnforceMultifactorAuthentication === 'true';

    return {
        siteName,
        enforceMultifactorAuthentication,
    };
}

export default connect(mapStateToProps)(Setup);
