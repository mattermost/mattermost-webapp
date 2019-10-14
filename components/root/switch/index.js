// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId, getCurrentUser, shouldShowTermsOfService} from 'mattermost-redux/selectors/entities/users';

import {checkIfMFARequired} from 'utils/route';

import {defaultRoute} from 'actions/global_actions.jsx';

import Switch from './switch.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    return {
        currentUserId: getCurrentUserId(state),
        defaultRoute: defaultRoute(state),
        noAccounts: config.NoAccounts === 'true',
        mfaRequired: checkIfMFARequired(getCurrentUser(state), license, config),
        showTermsOfService: shouldShowTermsOfService(state),
        iosDownloadLink: config.IosAppDownloadLink,
        androidDownloadLink: config.AndroidAppDownloadLink,
    };
}

export default withRouter(connect(mapStateToProps)(Switch));
