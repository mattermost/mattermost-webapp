// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import ShouldVerifyEmail from './should_verify_email.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const siteName = config.SiteName;

    return {
        ...ownProps,
        siteName
    };
}

export default connect(mapStateToProps)(ShouldVerifyEmail);
