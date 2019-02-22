// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {verifyUserEmail, getMe} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId, getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {clearErrors, logError} from 'mattermost-redux/actions/errors';

import DoVerifyEmail from './do_verify_email.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const siteName = config.SiteName;
    return {
        isLoggedIn: Boolean(getCurrentUserId(state)),
        siteName,
        user: getCurrentUser(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            verifyUserEmail,
            getMe,
            logError,
            clearErrors,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DoVerifyEmail);
