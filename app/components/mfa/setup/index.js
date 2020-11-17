// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {activateMfa, generateMfaSecret} from 'actions/views/mfa';

import Setup from './setup.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const siteName = config.SiteName;
    const enforceMultifactorAuthentication = config.EnforceMultifactorAuthentication === 'true';

    return {
        currentUser: getCurrentUser(state),
        siteName,
        enforceMultifactorAuthentication,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            activateMfa,
            generateMfaSecret,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setup);
