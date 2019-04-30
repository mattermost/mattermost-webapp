// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {sendVerificationEmail} from 'mattermost-redux/actions/users';

import ShouldVerifyEmail from './should_verify_email.jsx';

const mapStateToProps = (state) => {
    const {SiteName: siteName} = getConfig(state);
    return {siteName};
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        sendVerificationEmail,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShouldVerifyEmail);
